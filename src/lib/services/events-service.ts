import { toEventHistory } from '$lib/models/event-history';
import type { EventSortOrder } from '$lib/stores/event-view';
import type { WorkflowAPIRoutePath } from '$lib/types/api';
import type {
  CommonHistoryEvent,
  GetWorkflowExecutionHistoryResponse,
  HistoryEvent,
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
  };

export type FetchEventsParametersWithSettings = FetchEventsParameters & {
  settings: Settings;
  accessToken: string;
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
  const route = routeForApi(endpoint, { namespace, workflowId, runId });
  const response = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
        token,
        request: fetch,
      });
    },
    { onStart, onUpdate, onComplete },
  );

  return response.history.events;
};

export const fetchAllEvents = async ({
  namespace,
  workflowId,
  runId,
  sort,
  settings,
  accessToken,
  onStart,
  onUpdate,
  onComplete,
}: FetchEventsParametersWithSettings): Promise<CommonHistoryEvent[]> => {
  const endpoint = getEndpointForSortOrder(sort);
  const route = routeForApi(endpoint, { namespace, workflowId, runId });
  const response = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(route, {
        token,
        request: fetch,
      });
    },
    { onStart, onUpdate, onComplete },
  );

  const allEvents = await toEventHistory({
    response: response.history.events,
    namespace,
    settings,
    accessToken,
  });

  return allEvents;
};

export const fetchPartialRawEvents = async ({
  namespace,
  workflowId,
  runId,
  sort,
}: FetchEventsParameters): Promise<HistoryEvent[]> => {
  const route = routeForApi(`events.${sort}`, {
    namespace,
    workflowId,
    runId,
  });

  try {
    const response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
      route,
      {
        request: fetch,
        params: { maximumPageSize: '20' },
      },
    );

    return response.history.events;
  } catch (e) {
    return [];
  }
};

export const fetchStartAndEndEvents = async (
  parameters: FetchEventsParametersWithSettings,
): Promise<{ start: WorkflowEvents; end: WorkflowEvents }> => {
  const { settings, namespace, accessToken } = parameters;
  const startEventsRaw = await fetchPartialRawEvents({
    ...parameters,
    sort: 'ascending',
  });
  const endEventsRaw = await fetchPartialRawEvents({
    ...parameters,
    sort: 'descending',
  });
  const [start, end] = await Promise.all([
    toEventHistory({
      response: startEventsRaw,
      namespace,
      settings,
      accessToken,
    }),
    toEventHistory({
      response: endEventsRaw,
      namespace,
      settings,
      accessToken,
    }),
  ]);
  return { start, end };
};

type PaginatedEventParams = {
  namespace: string;
  workflowId: string;
  runId: string;
  sort?: EventSortOrder;
  category?: string;
  compact: boolean;
  settings: Settings;
  accessToken: string;
};

export async function getPaginatedEvents({
  namespace,
  workflowId,
  runId,
  sort,
  category,
  compact,
  settings,
  accessToken,
}: PaginatedEventParams): Promise<
  () => Promise<{ items: WorkflowEvents; nextPageToken: NextPageToken }>
> {
  return async (_pageSize = 100, token = '') => {
    const historyRoute = routeForApi(
      compact ? 'events.ascending' : `events.${sort}`,
      {
        namespace,
        workflowId,
        runId,
      },
    );
    const { history, nextPageToken } =
      await requestFromAPI<GetWorkflowExecutionHistoryResponse>(historyRoute, {
        request: fetch,
        params: {
          nextPageToken: token,
        },
      });

    const events = await toEventHistory({
      response: history.events,
      namespace,
      settings,
      accessToken,
    });

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
