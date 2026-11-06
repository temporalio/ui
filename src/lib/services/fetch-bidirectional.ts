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
  totalEstimated: number;
  descMinId: number;
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
  onRawPage: (events: HistoryEvent[]) => void;
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
  maximumPageSize,
  pauseAfterPages,
  onPause,
}: FetchBidirectionalParams): Promise<void> => {
  if (signal?.aborted) return;

  const handlePageError: ErrorCallback = (error) => {
    handleUnauthorizedOrForbiddenError(error);
    throw error;
  };

  const rootCtrl = new AbortController();
  const ascCtrl = new AbortController();
  const descCtrl = new AbortController();

  let ascMaxId = 0;
  let descMinId = Infinity;
  let descMaxId = 0;
  let pages = 0;
  let observedPageSize = 0;
  let winnerChosen = false;

  let pauseFired = false;
  let failure: Error | NetworkError | null = null;
  let reachedEnd = false;

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
      pages >= pauseAfterPages
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

  const runCursor = async ({
    direction,
    controller,
    sibling,
    updateBounds,
  }: {
    direction: 'ascending' | 'descending';
    controller: AbortController;
    sibling: AbortController;
    updateBounds: (id: number) => void;
  }) => {
    const route = routeForApi(`events.${direction}`, { namespace, workflowId });
    let token: Token;
    while (!controller.signal.aborted) {
      await checkPause(controller.signal);
      if (controller.signal.aborted) break;
      const g = gap();
      if (g <= 0) {
        sibling.abort();
        break;
      }
      if (observedPageSize > 0 && g <= observedPageSize && !winnerChosen) {
        winnerChosen = true;
        sibling.abort();
      }

      const response = await fetchPage(route, controller, token);
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

      pages++;
      observedPageSize = Math.max(observedPageSize, events.length);
      for (const event of events) updateBounds(parseInt(event.eventId));
      onRawPage(events);
      if (rootCtrl.signal.aborted) break;
      reportProgress();
      if (rootCtrl.signal.aborted) break;
      maybePause();

      if (!response.nextPageToken) reachedEnd = true;
      if (!response.nextPageToken || gap() <= 0) {
        sibling.abort();
        break;
      }
      token = String(response.nextPageToken);
    }
  };

  try {
    await Promise.all([
      runCursor({
        direction: 'ascending',
        controller: ascCtrl,
        sibling: descCtrl,
        updateBounds: (id) => {
          ascMaxId = Math.max(ascMaxId, id);
        },
      }),
      runCursor({
        direction: 'descending',
        controller: descCtrl,
        sibling: ascCtrl,
        updateBounds: (id) => {
          descMinId = Math.min(descMinId, id);
          descMaxId = Math.max(descMaxId, id);
        },
      }),
    ]);
    if (!signal?.aborted && failure && !reachedEnd && gap() > 0) {
      throw failure;
    }
  } finally {
    onAbort();
    signal?.removeEventListener('abort', onAbort);
  }
};
