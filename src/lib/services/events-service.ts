import { throttle } from 'es-toolkit';

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
} from '$lib/types/events';
import type {
  NamespaceScopedRequest,
  NextPageToken,
  PaginationCallbacks,
  Replace,
  WithoutNextPageToken,
} from '$lib/types/global';
import { isSortOrder } from '$lib/utilities/is';
import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type PaginatedHistoryResponse = Replace<
  GetWorkflowExecutionHistoryResponse,
  { nextPageToken?: NextPageToken }
>;

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
  sortOrder: EventSortOrder | undefined,
): WorkflowAPIRoutePath => {
  if (!sortOrder || !isSortOrder(sortOrder)) return 'events.descending';
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
  const response = await paginated<PaginatedHistoryResponse>(
    async (token?: NextPageToken) => {
      return (
        (await requestFromAPI<PaginatedHistoryResponse>(route, {
          token: token as string,
          request: fetch,
          params: { 'execution.runId': runId },
        })) ?? { history: { events: [] } }
      );
    },
    { onStart, onUpdate, onComplete },
  );

  return response?.history?.events ?? [];
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

  const onUpdate = (
    full: WithoutNextPageToken<GetWorkflowExecutionHistoryResponse>,
    current: WithoutNextPageToken<GetWorkflowExecutionHistoryResponse>,
  ) => {
    if (!signal) return;
    fullEventHistory.set([...toEventHistory(full.history?.events)]);
    const next = current?.history?.events;
    const hasNewHistory =
      historySize &&
      next?.every(
        (event: HistoryEvent) =>
          parseInt(event.eventId) > parseInt(historySize),
      );
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
  const response = await paginated<PaginatedHistoryResponse>(
    async (token?: NextPageToken) => {
      return (
        (await requestFromAPI<PaginatedHistoryResponse>(route, {
          token: token as string,
          request: fetch,
          params: {
            'execution.runId': runId,
            waitNewEvent: signal ? 'true' : 'false',
          },
          options: { signal },
        })) ?? { history: { events: [] } }
      );
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
  const route = routeForApi(getEndpointForSortOrder(sort), {
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

    return response?.history?.events ?? [];
  } catch {
    return [];
  }
};

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
