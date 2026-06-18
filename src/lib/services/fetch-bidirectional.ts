import type {
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
} from '$lib/types/events';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type BidirectionalProgress = {
  ascEvents: number;
  descEvents: number;
  ascPages: number;
  descPages: number;
  elapsedMs: number;
  ascMaxId: number;
  descMinId: number;
  totalEstimated: number;
};

export type BidirectionalStats = {
  durationMs: number;
  totalEvents: number;
  overlap: number;
  ascPages: number;
  descPages: number;
  eventsPerSecond: number;
  winner: 'ascending' | 'descending' | 'tie';
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
  maximumPageSize?: number;
};

export const fetchBidirectional = async ({
  namespace,
  workflowId,
  runId,
  signal,
  onProgress,
  onRawPage,
  maximumPageSize,
}: FetchBidirectionalParams): Promise<BidirectionalStats> => {
  const t0 = performance.now();

  const ascCtrl = new AbortController();
  const descCtrl = new AbortController();
  signal?.addEventListener('abort', () => {
    ascCtrl.abort();
    descCtrl.abort();
  });

  let ascMaxId = 0;
  let descMinId = Infinity;
  let descMaxId = 0;
  let ascPages = 0;
  let descPages = 0;
  let observedPageSize = 0;
  let winnerChosen = false;
  let totalEvents = 0;

  const seen = new Set<number>();

  const gap = () => Math.max(0, descMinId - ascMaxId - 1);

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

  const runAscending = async () => {
    const route = routeForApi('events.ascending', { namespace, workflowId });
    let token: Token;
    while (!ascCtrl.signal.aborted) {
      const g = gap();
      if (g <= 0) {
        descCtrl.abort();
        break;
      }
      if (observedPageSize > 0 && g <= observedPageSize && !winnerChosen) {
        winnerChosen = true;
        descCtrl.abort();
      }

      let response: GetWorkflowExecutionHistoryResponse;
      try {
        response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
          route,
          {
            token,
            request: fetch,
            params: {
              'execution.runId': runId,
              waitNewEvent: 'false',
              ...(maximumPageSize && {
                maximumPageSize: String(maximumPageSize),
              }),
            },
            options: { signal: ascCtrl.signal },
          },
        );
      } catch {
        break;
      }

      const events = (response?.history?.events ?? []) as HistoryEvent[];
      if (!events.length) break;

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
      reportProgress();

      if (!response.nextPageToken || gap() <= 0) {
        descCtrl.abort();
        break;
      }
      token = response.nextPageToken as unknown as string;
    }
  };

  const runDescending = async () => {
    const route = routeForApi('events.descending', { namespace, workflowId });
    let token: Token;
    while (!descCtrl.signal.aborted) {
      const g = gap();
      if (g <= 0) {
        ascCtrl.abort();
        break;
      }
      if (observedPageSize > 0 && g <= observedPageSize && !winnerChosen) {
        winnerChosen = true;
        ascCtrl.abort();
      }

      let response: GetWorkflowExecutionHistoryResponse;
      try {
        response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
          route,
          {
            token,
            request: fetch,
            params: {
              'execution.runId': runId,
              waitNewEvent: 'false',
              ...(maximumPageSize && {
                maximumPageSize: String(maximumPageSize),
              }),
            },
            options: { signal: descCtrl.signal },
          },
        );
      } catch {
        break;
      }

      const events = (response?.history?.events ?? []) as HistoryEvent[];
      if (!events.length) break;

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
      reportProgress();

      if (!response.nextPageToken || gap() <= 0) {
        ascCtrl.abort();
        break;
      }
      token = response.nextPageToken as unknown as string;
    }
  };

  await Promise.allSettled([runAscending(), runDescending()]);

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
