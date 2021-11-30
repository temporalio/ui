import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';

type FetchEvents = NamespaceScopedRequest &
  PaginationCallbacks<GetWorkflowExecutionHistoryResponse> & {
    executionId: string;
    runId: string;
  };

export const fetchEvents = async (
  { namespace, executionId, runId, onStart, onUpdate, onComplete }: FetchEvents,
  request = fetch,
): Promise<GetWorkflowExecutionHistoryResponse> => {
  const events: GetWorkflowExecutionHistoryResponse = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}/events`,
        {
          token,
          request,
        },
      );
    },
    { onStart, onUpdate, onComplete },
  );

  return events;
};
