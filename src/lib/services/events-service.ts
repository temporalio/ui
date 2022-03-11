import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toEventHistory } from '$lib/models/event-history';

type FetchEvents = NamespaceScopedRequest &
  PaginationCallbacks<GetWorkflowExecutionHistoryResponse> & {
    executionId: string;
    runId: string;
    rawPayloads?: boolean;
  };

export const fetchRawEvents = async (
  { namespace, executionId, runId, onStart, onUpdate, onComplete }: FetchEvents,
  request = fetch,
): Promise<HistoryEvent[]> => {
  const response = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        routeForApi('events', { namespace, executionId, runId }),
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

export const fetchEvents = (
  parameters: FetchEvents,
  request = fetch,
): Promise<FetchEventsResponse> => {
  return fetchRawEvents(parameters, request).then(toEventHistory);
};
