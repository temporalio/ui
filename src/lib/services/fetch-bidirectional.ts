import type {
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
} from '$lib/types/events';
import type { NetworkError } from '$lib/types/global';
import { getErrorMessage } from '$lib/utilities/error-message';
import { handleUnauthorizedOrForbiddenError } from '$lib/utilities/handle-error';
import { isNetworkError } from '$lib/utilities/is-network-error';
import {
  type ErrorCallback,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type BidirectionalProgress = {
  ascEvents: number;
  descEvents: number;
  ascPages: number;
  descPages: number;
  elapsedMs: number;
  ascMaxId: number;
  descMinId: number;
  totalEstimated: number;
};

type BidirectionalStats = {
  durationMs: number;
  totalEvents: number;
  overlap: number;
  ascPages: number;
  descPages: number;
  eventsPerSecond: number;
  winner: 'ascending' | 'descending' | 'tie';
};

export type PauseHandle = {
  /** Call to unblock the paused cursors and resume fetching the rest. */
  resume: () => void;
};

export type FetchBidirectionalParams = {
  namespace: string;
  workflowId: string;
  runId: string;
  signal?: AbortSignal;
  onProgress?: (p: BidirectionalProgress) => void;
  /** Fires after every page with that page's raw events and direction flag.
   *  Feed directly into processEvent() to resolve buffer Promises live. */
  onRawPage: (events: HistoryEvent[], isAscending: boolean) => void;
  /** Fires once with the raw events from the first descending page — the most
   *  recent events in the history. Use to call setFailedEvent() before the
   *  ascending cursor processes events that affect billableActions. */
  onFirstDescPage?: (events: HistoryEvent[]) => void;
  maximumPageSize?: number;
  /** After this many total pages (asc + desc combined), pause both cursors and
   *  call onPause with a handle whose resume() continues the fetch. */
  pauseAfterPages?: number;
  /** Called once when the pauseAfterPages threshold is reached. */
  onPause?: (handle: PauseHandle) => void;
};

export const fetchBidirectional = async ({
  namespace,
  workflowId,
  runId,
  signal,
  onProgress,
  onRawPage,
  onFirstDescPage,
  maximumPageSize,
  pauseAfterPages,
  onPause,
}: FetchBidirectionalParams): Promise<BidirectionalStats> => {
  if (signal?.aborted) {
    return {
      durationMs: 0,
      totalEvents: 0,
      overlap: 0,
      ascPages: 0,
      descPages: 0,
      eventsPerSecond: 0,
      winner: 'tie',
    };
  }

  const handlePageError: ErrorCallback = (error) => {
    handleUnauthorizedOrForbiddenError(error);
    throw error;
  };

  const t0 = performance.now();

  const rootCtrl = new AbortController();
  const ascCtrl = new AbortController();
  const descCtrl = new AbortController();

  let ascMaxId = 0;
  let descMinId = Infinity;
  let descMaxId = 0;
  let ascPages = 0;
  let descPages = 0;
  let observedPageSize = 0;
  let winnerChosen = false;
  let totalEvents = 0;
  let pauseFired = false;
  let failure: Error | NetworkError | null = null;
  let reachedEnd = false;

  const seen = new Set<number>();

  const gap = () => Math.max(0, descMinId - ascMaxId - 1);

  // Pause latch: both cursor loops await this before each iteration.
  // When pauseAfterPages is reached, a new Promise is created here and
  // onPause is called. resume() resolves it, unblocking both loops.
  let pauseLatch: Promise<void> | null = null;

  let resumePause: (() => void) | undefined;

  const releasePause = () => {
    pauseLatch = null;
    resumePause?.();
    resumePause = undefined;
  };

  const onAbort = () => {
    rootCtrl.abort();
    ascCtrl.abort();
    descCtrl.abort();
    releasePause();
  };
  signal?.addEventListener('abort', onAbort);

  const checkPause = async (cursorSignal: AbortSignal) => {
    if (!pauseLatch || cursorSignal.aborted) return;
    let onCursorAbort = () => {};
    try {
      await Promise.race([
        pauseLatch,
        new Promise<void>((resolve) => {
          onCursorAbort = resolve;
          cursorSignal.addEventListener('abort', onCursorAbort, { once: true });
        }),
      ]);
    } finally {
      cursorSignal.removeEventListener('abort', onCursorAbort);
    }
  };

  const maybePause = () => {
    if (
      !pauseFired &&
      pauseAfterPages !== undefined &&
      onPause &&
      ascPages + descPages >= pauseAfterPages
    ) {
      pauseFired = true;
      pauseLatch = new Promise<void>((resolve) => {
        resumePause = resolve;
      });
      onPause({ resume: releasePause });
    }
  };

  const reportProgress = () => {
    onProgress?.({
      ascEvents: ascMaxId,
      descEvents: totalEvents - descMinId + 1,
      ascPages,
      descPages,
      elapsedMs: performance.now() - t0,
      ascMaxId,
      descMinId: descMinId === Infinity ? 0 : descMinId,
      totalEstimated: descMaxId,
    });
  };

  type Token = string | undefined;

  const fetchPage = async (
    route: string,
    controller: AbortController,
    token: Token,
  ): Promise<GetWorkflowExecutionHistoryResponse | undefined> => {
    try {
      const response =
        await requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
          token,
          request: fetch,
          params: {
            'execution.runId': runId,
            waitNewEvent: 'false',
            ...(maximumPageSize && {
              maximumPageSize: String(maximumPageSize),
            }),
          },
          options: { signal: controller.signal },
          handleError: handlePageError,
        });
      if (!response) throw new Error('Missing workflow history response.');
      return response;
    } catch (error) {
      if (controller.signal.aborted) return;
      failure ??=
        error instanceof Error || isNetworkError(error)
          ? error
          : new Error(getErrorMessage(error));
      pauseFired = true;
      releasePause();
    }
  };

  const runAscending = async () => {
    const route = routeForApi('events.ascending', { namespace, workflowId });
    let token: Token;
    while (!ascCtrl.signal.aborted) {
      await checkPause(ascCtrl.signal);
      if (ascCtrl.signal.aborted) break;
      const g = gap();
      if (g <= 0) {
        descCtrl.abort();
        break;
      }
      if (observedPageSize > 0 && g <= observedPageSize && !winnerChosen) {
        winnerChosen = true;
        descCtrl.abort();
      }

      const response = await fetchPage(route, ascCtrl, token);
      if (!response || rootCtrl.signal.aborted) break;

      const events = response.history?.events ?? [];
      if (!events.length) {
        if (response.nextPageToken) {
          token = String(response.nextPageToken);
          continue;
        }
        reachedEnd = true;
        break;
      }

      ascPages++;
      observedPageSize = Math.max(observedPageSize, events.length);

      const fresh: HistoryEvent[] = [];
      for (const e of events) {
        const id = parseInt(e.eventId);
        if (id > ascMaxId) ascMaxId = id;
        if (!seen.has(id)) {
          seen.add(id);
          fresh.push(e);
        }
      }
      if (fresh.length) onRawPage(fresh, true);
      if (rootCtrl.signal.aborted) break;
      reportProgress();
      if (rootCtrl.signal.aborted) break;
      maybePause();

      if (!response.nextPageToken) reachedEnd = true;
      if (!response.nextPageToken || gap() <= 0) {
        descCtrl.abort();
        break;
      }
      token = String(response.nextPageToken);
    }
  };

  const runDescending = async () => {
    const route = routeForApi('events.descending', { namespace, workflowId });
    let token: Token;
    while (!descCtrl.signal.aborted) {
      await checkPause(descCtrl.signal);
      if (descCtrl.signal.aborted) break;
      const g = gap();
      if (g <= 0) {
        ascCtrl.abort();
        break;
      }
      if (observedPageSize > 0 && g <= observedPageSize && !winnerChosen) {
        winnerChosen = true;
        ascCtrl.abort();
      }

      const response = await fetchPage(route, descCtrl, token);
      if (!response || rootCtrl.signal.aborted) break;

      const events = response.history?.events ?? [];
      if (!events.length) {
        if (response.nextPageToken) {
          token = String(response.nextPageToken);
          continue;
        }
        reachedEnd = true;
        break;
      }

      descPages++;
      observedPageSize = Math.max(observedPageSize, events.length);

      const fresh: HistoryEvent[] = [];
      for (const e of events) {
        const id = parseInt(e.eventId);
        if (id < descMinId) descMinId = id;
        if (id > descMaxId) {
          descMaxId = id;
          totalEvents = id;
        }
        if (!seen.has(id)) {
          seen.add(id);
          fresh.push(e);
        }
      }
      if (fresh.length) onRawPage(fresh, false);
      if (rootCtrl.signal.aborted) break;
      if (descPages === 1) onFirstDescPage?.(fresh);
      if (rootCtrl.signal.aborted) break;
      reportProgress();
      if (rootCtrl.signal.aborted) break;
      maybePause();

      if (!response.nextPageToken) reachedEnd = true;
      if (!response.nextPageToken || gap() <= 0) {
        ascCtrl.abort();
        break;
      }
      token = String(response.nextPageToken);
    }
  };

  try {
    await Promise.all([runAscending(), runDescending()]);
    if (!signal?.aborted && failure && !reachedEnd && gap() > 0) {
      throw failure;
    }
  } finally {
    onAbort();
    signal?.removeEventListener('abort', onAbort);
  }

  const durationMs = performance.now() - t0;
  const total = seen.size;
  const fetched =
    ascPages * (observedPageSize || 1) + descPages * (observedPageSize || 1);
  const overlap = Math.max(0, fetched - total);

  const winner: BidirectionalStats['winner'] =
    ascPages === descPages
      ? 'tie'
      : ascPages > descPages
        ? 'ascending'
        : 'descending';

  return {
    durationMs,
    totalEvents: total,
    overlap,
    ascPages,
    descPages,
    eventsPerSecond: Math.round(total / (durationMs / 1000)),
    winner,
  };
};
