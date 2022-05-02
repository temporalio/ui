import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toEventHistory } from '$lib/models/event-history';

type FetchEvents = NamespaceScopedRequest &
  PaginationCallbacks<GetWorkflowExecutionHistoryResponse> & {
    workflowId: string;
    runId: string;
    rawPayloads?: boolean;
    reverse?: boolean;
  };

export const fetchRawEvents = async (
  {
    namespace,
    workflowId,
    runId,
    reverse,
    onStart,
    onUpdate,
    onComplete,
  }: FetchEvents,
  request = fetch,
): Promise<HistoryEvent[]> => {
  const endpoint: WorkflowAPIRoutePath = reverse ? 'events.reverse' : 'events';
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
  parameters: FetchEvents,
  settings: Settings,
  request = fetch,
): Promise<FetchEventsResponse> => {
  return fetchRawEvents(parameters, request).then((response) =>
    toEventHistory({ response, namespace: parameters.namespace, settings }),
  );
};
