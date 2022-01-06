import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type FetchEvents = NamespaceScopedRequest &
  PaginationCallbacks<GetWorkflowExecutionHistoryResponse> & {
    executionId: string;
    runId: string;
    rawPayloads?: boolean;
  };

export const fetchEvents = async (
  {
    namespace,
    executionId,
    runId,
    rawPayloads = false,
    onStart,
    onUpdate,
    onComplete,
  }: FetchEvents,
  request = fetch,
): Promise<GetWorkflowExecutionHistoryResponse> => {
  console.log('fetchEvents');
  let params = {};

  if (rawPayloads) {
    params = { params: { rawPayloads: JSON.stringify(true) } };
  }

  const events: GetWorkflowExecutionHistoryResponse = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        routeForApi('events', { namespace, executionId, runId }),
        {
          token,
          request,
          ...params,
        },
      );
    },
    { onStart, onUpdate, onComplete },
  );

  return events;
};
