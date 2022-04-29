import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toEventHistory } from '$lib/models/event-history';
import type { EventSortOrder } from '$lib/stores/event-view';

export type FetchEventsParameters = NamespaceScopedRequest &
  PaginationCallbacks<GetWorkflowExecutionHistoryResponse> & {
    workflowId: string;
    runId: string;
    rawPayloads?: boolean;
    sort?: string;
  };

const isSortOrder = (sortOrder: string): sortOrder is EventSortOrder => {
  if (sortOrder === 'ascending') return true;
  if (sortOrder === 'descending') return true;
  return false;
};

const getEndpointForSortOrder = (sortOrder: string): WorkflowAPIRoutePath => {
  if (!isSortOrder(sortOrder)) return 'events.descending';
  if (sortOrder === 'descending') return 'events.descending';
  if (sortOrder === 'ascending') return 'events.ascending';
  return 'events.descending';
};

export const fetchRawEvents = async (
  {
    namespace,
    workflowId,
    runId,
    sort,
    onStart,
    onUpdate,
    onComplete,
  }: FetchEventsParameters,
  request = fetch,
): Promise<HistoryEvent[]> => {
  const endpoint = getEndpointForSortOrder(sort);

  const response = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        routeForApi(endpoint, { namespace, workflowId, runId }),
        {
          token,
          request,
        },
      );
    },
    { onStart, onUpdate, onComplete },
  );

  return response.history.events;
};

export const fetchEvents = async (
  parameters: FetchEventsParameters,
  request = fetch,
): Promise<FetchEventsResponse> => {
  return fetchRawEvents(parameters, request).then(toEventHistory);
};
