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

import type {
  BidirectionalProgress,
  BidirectionalStats,
} from './fetch-bidirectional';

export type { BidirectionalProgress, BidirectionalStats };

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
  onFirstPage,
  onFirstDescPage,
  onPage,
  maximumPageSize,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
  signal?: AbortSignal;
  onProgress?: (p: BidirectionalProgress) => void;
  /** Fires after the first ascending page resolves with just that page's events. */
  onFirstPage?: (events: CommonHistoryEvent[]) => void;
  /**
   * Fires after the first descending page resolves with a snapshot of ALL events
   * accumulated so far from both cursors — sorted ascending, no duplicates.
   * Use together with onFirstPage to render both bookends (oldest + newest) before
   * the full fetch completes, then let .then() render the complete set.
   */
  onFirstDescPage?: (accumulated: CommonHistoryEvent[]) => void;
  /**
   * Fires after every page from either direction with a snapshot of ALL events
   * accumulated so far — sorted ascending, no duplicates — ready for groupEvents.
   * Use this instead of onFirstPage for per-page streaming render.
   */
  onPage?: (accumulated: CommonHistoryEvent[]) => void;
  maximumPageSize?: number;
}): Promise<{ events: CommonHistoryEvent[]; stats: BidirectionalStats }> => {
  const t0 = performance.now();

  const ascCtrl = new AbortController();
  const descCtrl = new AbortController();
  const onAbort = () => {
    ascCtrl.abort();
    descCtrl.abort();
  };
  signal?.addEventListener('abort', onAbort);

  let ascMaxId = 0;
  let descMinId = Infinity;
  let descMaxId = 0;
  let ascPages = 0;
  let descPages = 0;
  let observedPageSize = 0;
  let winnerChosen = false;

  // Single pre-allocated slot array indexed by eventId - 1. Allocated lazily
  // once the first descending page reveals the total event count. Events from
  // both directions write directly into their slot, so writes are idempotent
  // and no merge copy is needed.
  let slots: (HistoryEvent | undefined)[] | null = null;
  // Small temp buffer for ascending events that arrive before slots is ready.
  const tempBuf: HistoryEvent[] = [];
  let ascEventCount = 0;
  let descEventCount = 0;

  const initSlots = (n: number) => {
    if (slots !== null) return;
    slots = new Array(n);
    for (const e of tempBuf) slots[parseInt(e.eventId) - 1] = e;
    tempBuf.length = 0;
  };

  type Token = string | undefined;

  const gap = () => Math.max(0, descMinId - ascMaxId - 1);

  // Snapshot the current slots array as a sorted, duplicate-free CommonHistoryEvent[].
  // slots is indexed by eventId-1 so iteration order is ascending — no sort needed.
  // The ascending cursor fills a contiguous prefix [0, ascMaxId) and the descending
  // cursor a contiguous suffix [descMinId-1, descMaxId); iterating only those ranges
  // avoids rescanning the not-yet-fetched middle on every page.
  const snapshotAccumulated = (): CommonHistoryEvent[] => {
    if (slots === null) return toEventHistory(tempBuf);
    const filled: HistoryEvent[] = [];
    for (let i = 0; i < ascMaxId; i++) {
      if (slots[i] !== undefined) filled.push(slots[i]!);
    }
    const descStart = Math.max(ascMaxId, descMinId - 1);
    for (let i = descStart; i < descMaxId; i++) {
      if (slots[i] !== undefined) filled.push(slots[i]!);
    }
    return toEventHistory(filled);
  };

  const reportProgress = () => {
    onProgress?.({
      ascEvents: ascEventCount,
      descEvents: descEventCount,
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
      ascEventCount += events.length;
      for (const e of events) {
        const id = parseInt(e.eventId);
        if (id > ascMaxId) ascMaxId = id;
        if (slots !== null) slots[id - 1] = e;
        else tempBuf.push(e);
      }
      reportProgress();
      if (ascPages === 1 && onFirstPage) {
        onFirstPage(toEventHistory(events as HistoryEvent[]));
      }
      onPage?.(snapshotAccumulated());

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
      descEventCount += events.length;
      // Compute bounds before writing so initSlots has the correct total.
      for (const e of events) {
        const id = parseInt(e.eventId);
        if (id < descMinId) descMinId = id;
        if (id > descMaxId) descMaxId = id;
      }
      initSlots(descMaxId);
      for (const e of events) {
        slots![parseInt(e.eventId) - 1] = e;
      }
      reportProgress();
      const snap =
        (onFirstDescPage && descPages === 1) || onPage
          ? snapshotAccumulated()
          : null;
      if (descPages === 1) onFirstDescPage?.(snap!);
      if (snap) onPage?.(snap);

      if (!response.nextPageToken || gap() <= 0) {
        ascCtrl.abort();
        break;
      }
      token = response.nextPageToken as unknown as string;
    }
  };

  await Promise.allSettled([runAscending(), runDescending()]);
  signal?.removeEventListener('abort', onAbort);

  // Compact: remove unfilled slots (can occur at the fetch boundary where the
  // winner aborted before the other side finished its last page).
  const rawFinal = slots ?? (tempBuf as (HistoryEvent | undefined)[]);
  let write = 0;
  for (let i = 0; i < rawFinal.length; i++) {
    const e = rawFinal[i];
    if (e !== undefined) rawFinal[write++] = e;
  }
  rawFinal.length = write;

  const totalFetched = ascEventCount + descEventCount;
  const merged: CommonHistoryEvent[] = toEventHistory(
    rawFinal as HistoryEvent[],
  );
  rawFinal.length = 0;

  const durationMs = performance.now() - t0;
  const overlap = totalFetched - merged.length;

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
