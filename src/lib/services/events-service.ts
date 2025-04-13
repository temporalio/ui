import throttle from 'just-throttle';

import { toEventHistory } from '$lib/models/event-history';
import type { EventSortOrder } from '$lib/stores/event-view';
import { fullEventHistory } from '$lib/stores/events';
import { refresh } from '$lib/stores/workflow-run';
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
  Settings,
} from '$lib/types/global';
import { isSortOrder } from '$lib/utilities/is';
import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

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

export type FetchEventsParametersWithSettings = FetchEventsParameters & {
  settings: Settings;
  accessToken: string;
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
  refresh.set(Date.now());
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
    refresh.set(Date.now());
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
  } catch (e) {
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
