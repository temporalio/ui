import type { GetWorkflowExecutionHistoryResponse } from '$lib/types';

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

  const response = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        routeForApi(endpoint, { namespace, workflowId, runId }),
        {
          token,
          request: fetch,
        },
      );
    },
    { onStart, onUpdate, onComplete },
  );

  return response.history.events;
};

export const fetchEvents = async (
  parameters: FetchEventsParametersWithSettings,
): Promise<FetchEventsResponse> => {
  const { settings, namespace } = parameters;
  return fetchRawEvents(parameters).then((response) =>
    toEventHistory({ response, namespace, settings }),
  );
};
