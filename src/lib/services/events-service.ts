import throttle from 'just-throttle';

import { toEventHistory } from '$lib/models/event-history';
import type { EventSortOrder } from '$lib/stores/event-view';
import { fullEventHistory } from '$lib/stores/events';
import { triggerRefresh } from '$lib/stores/workflow-run';
import type { WorkflowAPIRoutePath } from '$lib/types/api';
import type {
  CommonHistoryEvent,
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
  WorkflowEvent,
  WorkflowEvents,
} from '$lib/types/events';
import type {
  NamespaceScopedRequest,
  NextPageToken,
  PaginationCallbacks,
} from '$lib/types/global';
import { isSortOrder } from '$lib/utilities/is';
import { paginated } from '$lib/utilities/paginated';
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

export type FetchEventsParameters = NamespaceScopedRequest &
  PaginationCallbacks<GetWorkflowExecutionHistoryResponse> & {
    workflowId: string;
    runId: string;
    rawPayloads?: boolean;
    sort?: EventSortOrder;
    signal?: AbortSignal;
    historySize?: string;
    maximumPageSize?: string;
  };

export const getEndpointForRawHistory = ({
  namespace,
  workflowId,
  runId,
}: FetchEventsParameters): string => {
  return routeForApi(
    'events.raw',
    {
      namespace,
      workflowId,
      runId,
    },
    true,
  );
};

const getEndpointForSortOrder = (
  sortOrder: EventSortOrder,
): WorkflowAPIRoutePath => {
  if (!isSortOrder(sortOrder)) return 'events.descending';
  if (sortOrder === 'descending') return 'events.descending';
  if (sortOrder === 'ascending') return 'events.ascending';
  return 'events.descending';
};

export const fetchRawEvents = async ({
  namespace,
  workflowId,
  runId,
  sort,
  onStart,
  onUpdate,
  onComplete,
}: FetchEventsParameters): Promise<HistoryEvent[]> => {
  const endpoint = getEndpointForSortOrder(sort);
  const route = routeForApi(endpoint, { namespace, workflowId });
  const response = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
        token,
        request: fetch,
        params: { 'execution.runId': runId },
      });
    },
    { onStart, onUpdate, onComplete },
  );

  return response.history.events;
};

export const throttleRefresh = throttle(() => {
  triggerRefresh();
}, 5000);

export const fetchAllEvents = async ({
  namespace,
  workflowId,
  runId,
  sort = 'ascending',
  signal,
  historySize,
}: FetchEventsParameters): Promise<CommonHistoryEvent[]> => {
  const onStart = () => {
    if (!signal) return;
    fullEventHistory.set([]);
  };

  const onUpdate = (full, current) => {
    if (!signal) return;
    fullEventHistory.set([...toEventHistory(full.history?.events)]);
    const next = current?.history?.events;
    const hasNewHistory =
      historySize &&
      next?.every((e) => parseInt(e.eventId) > parseInt(historySize));
    if (hasNewHistory) {
      throttleRefresh();
    }
  };

  const onComplete = () => {
    if (!signal) return;
    triggerRefresh();
  };

  const endpoint = getEndpointForSortOrder(sort);
  const route = routeForApi(endpoint, { namespace, workflowId });
  const response = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
        token,
        request: fetch,
        params: {
          'execution.runId': runId,
          waitNewEvent: signal ? 'true' : 'false',
        },
        options: { signal },
      });
    },
    { onStart, onUpdate, onComplete },
  );

  if (!response?.history) return [];
  const allEvents = await toEventHistory(response.history.events);
  return allEvents;
};

export const fetchPartialRawEvents = async ({
  namespace,
  workflowId,
  runId,
  sort,
  maximumPageSize = '20',
}: FetchEventsParameters): Promise<HistoryEvent[]> => {
  const route = routeForApi(`events.${sort}`, {
    namespace,
    workflowId,
  });

  try {
    const response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
      route,
      {
        request: fetch,
        params: { maximumPageSize, 'execution.runId': runId },
      },
    );

    return response.history.events;
  } catch {
    return [];
  }
};

type PaginatedEventParams = {
  namespace: string;
  workflowId: string;
  runId: string;
  sort?: EventSortOrder;
  category?: string;
  compact: boolean;
};

export async function getPaginatedEvents({
  namespace,
  workflowId,
  runId,
  sort,
  category,
  compact,
}: PaginatedEventParams): Promise<
  () => Promise<{ items: WorkflowEvents; nextPageToken: NextPageToken }>
> {
  return async (_pageSize = 100, token = '') => {
    const historyRoute = routeForApi(
      compact ? 'events.ascending' : `events.${sort}`,
      {
        namespace,
        workflowId,
      },
    );
    const { history, nextPageToken } =
      await requestFromAPI<GetWorkflowExecutionHistoryResponse>(historyRoute, {
        request: fetch,
        params: {
          nextPageToken: token,
          'execution.runId': runId,
        },
      });

    const events = await toEventHistory(history.events);

    if (category) {
      return {
        items: events?.filter((event) => event.category === category),
        nextPageToken: nextPageToken ?? '',
      };
    }
    return {
      items: events,
      nextPageToken: nextPageToken ?? '',
    };
  };
}

export const fetchInitialEvent = async (
  parameters: FetchEventsParameters,
): Promise<WorkflowEvent> => {
  const startEventsRaw = await fetchPartialRawEvents({
    ...parameters,
    sort: 'ascending',
    maximumPageSize: '1',
  });
  const start = await toEventHistory(startEventsRaw);
  return start[0];
};

export const fetchAllEventsBidirectional = async ({
  namespace,
  workflowId,
  runId,
  signal,
  onProgress,
  maximumPageSize,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
  signal?: AbortSignal;
  onProgress?: (p: BidirectionalProgress) => void;
  maximumPageSize?: number;
}): Promise<{ events: CommonHistoryEvent[]; stats: BidirectionalStats }> => {
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

  const ascBucket: CommonHistoryEvent[] = [];
  const descBucket: CommonHistoryEvent[] = [];

  type Token = string | undefined;

  const gap = () => Math.max(0, descMinId - ascMaxId - 1);

  const reportProgress = () => {
    onProgress?.({
      ascEvents: ascBucket.length,
      descEvents: descBucket.length,
      ascPages,
      descPages,
      elapsedMs: performance.now() - t0,
      ascMaxId,
      descMinId: descMinId === Infinity ? 0 : descMinId,
      totalEstimated: descMaxId,
    });
  };

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
      const events = response?.history?.events ?? [];
      if (!events.length) break;

      ascPages++;
      observedPageSize = Math.max(observedPageSize, events.length);
      const ascNonOverlap = events.filter(
        (e) => parseInt(e.eventId) < descMinId,
      );
      ascBucket.push(...toEventHistory(ascNonOverlap));
      ascMaxId = Math.max(ascMaxId, ...events.map((e) => parseInt(e.eventId)));
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
      const events = response?.history?.events ?? [];
      if (!events.length) break;

      descPages++;
      observedPageSize = Math.max(observedPageSize, events.length);
      const descNonOverlap = events.filter(
        (e) => parseInt(e.eventId) > ascMaxId,
      );
      descBucket.push(...toEventHistory(descNonOverlap));
      const descIds = events.map((e) => parseInt(e.eventId));
      descMinId = Math.min(descMinId, ...descIds);
      descMaxId = Math.max(descMaxId, ...descIds);
      reportProgress();

      if (!response.nextPageToken || gap() <= 0) {
        ascCtrl.abort();
        break;
      }
      token = response.nextPageToken as unknown as string;
    }
  };

  await Promise.allSettled([runAscending(), runDescending()]);

  // Merge and sort. Dedup is a safety net for the rare case where a page was
  // already in-flight when the winner aborted the other direction.
  const seen = new Set<string>();
  const merged: CommonHistoryEvent[] = [];
  for (const e of [...ascBucket, ...descBucket].sort(
    (a, b) => parseInt(a.id) - parseInt(b.id),
  )) {
    if (!seen.has(e.id)) {
      seen.add(e.id);
      merged.push(e);
    }
  }

  const durationMs = performance.now() - t0;
  const overlap = ascBucket.length + descBucket.length - merged.length;

  const winner: BidirectionalStats['winner'] =
    ascPages === descPages
      ? 'tie'
      : ascPages > descPages
        ? 'ascending'
        : 'descending';

  return {
    events: merged,
    stats: {
      durationMs,
      totalEvents: merged.length,
      overlap,
      ascPages,
      descPages,
      eventsPerSecond: Math.round(merged.length / (durationMs / 1000)),
      winner,
    },
  };
};
