import type { GetWorkflowExecutionHistoryResponse } from '$types';

import { paginated } from '$lib/utilities/paginated';
import { requestFromAPI } from '$lib/utilities/request-from-api';

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
    rawPayloads,
    onStart,
    onUpdate,
    onComplete,
  }: FetchEvents,
  request = fetch,
): Promise<GetWorkflowExecutionHistoryResponse> => {
  let params = {};

  if (rawPayloads) {
    params = { params: { rawPayloads: JSON.stringify(true) } };
  }

  const events: GetWorkflowExecutionHistoryResponse = await paginated(
    async (token: string) => {
      return requestFromAPI<GetWorkflowExecutionHistoryResponse>(
        `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}/events`,
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
