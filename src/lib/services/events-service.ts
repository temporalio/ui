import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toEventHistory } from '$lib/models/event-history';
import type { EventSortOrder } from '$lib/stores/event-view';
import { isSortOrder } from '$lib/utilities/is';

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
  const route = await routeForApi(endpoint, { namespace, workflowId, runId });
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

export const fetchEvents = async (
  parameters: FetchEventsParametersWithSettings,
): Promise<FetchEventsResponse> => {
  const { settings, namespace, accessToken } = parameters;
  return fetchRawEvents(parameters).then((response) =>
    toEventHistory({ response, namespace, settings, accessToken }),
  );
};


export const fetchPartialRawEvents = async ({
  namespace,
  workflowId,
  runId,
  sort,
  onStart,
  onUpdate,
  onComplete,
}: FetchEventsParameters): Promise<HistoryEvent[]> => {
  const descendingRoute = await routeForApi('events.descending', { namespace, workflowId, runId });
  const ascendingRoute = await routeForApi('events.ascending', { namespace, workflowId, runId });

  const descendingRequest = requestFromAPI<GetWorkflowExecutionHistoryResponse>(descendingRoute, {
    request: fetch,
    params: { maximumPageSize: '100' }
  });
  const ascendingRouteRequest = requestFromAPI<GetWorkflowExecutionHistoryResponse>(ascendingRoute, {
    request: fetch,
    params: { maximumPageSize: '100' }
  });

  const [descendingResponse, ascendingRouteResponse] = await Promise.all([descendingRequest, ascendingRouteRequest])

  return descendingResponse.history.events;
};

export const fetchPartialEvents = async (
  parameters: FetchEventsParametersWithSettings,
): Promise<FetchEventsResponse> => {
  const { settings, namespace, accessToken } = parameters;
  return fetchPartialRawEvents(parameters).then((response) =>
    toEventHistory({ response, namespace, settings, accessToken }),
  );
};


export async function getPaginatedEvents({
  namespace,
  workflowId,
  runId,
  sort,
}): Promise<() => Promise<{ items: HistoryEvent[], nextPageToken: string }>> {
  return async (pageSize = 100, token = '') => {
    const descendingRoute = await routeForApi(`events.${sort}`, { namespace, workflowId, runId });
    const { history, nextPageToken } = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(descendingRoute, {
      request: fetch,
      params: { maximumPageSize: pageSize.toString(), nextPageToken: token }
    });

    const { events, eventGroups } = await toEventHistory({ response: history.events, namespace })
    return { items: events, nextPageToken }
  };
}

