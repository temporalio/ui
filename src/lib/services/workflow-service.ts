import type { ErrorCallback } from '$lib/utilities/request-from-api';

import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';

import { toListWorkflowQuery } from '$lib/utilities/list-workflow-query';
import { ApiRoutes } from '$lib/utilities/route-for-api';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  workflowId: string;
  runId: string;
};

export type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageToken: string;
  error?: string;
};

export const fetchAllWorkflows = async (
  namespace: string,
  parameters: ValidWorkflowParameters,
  request = fetch,
  archived = false,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const query = parameters.query || toListWorkflowQuery(parameters);
  const endpoint: ValidWorkflowEndpoints = archived
    ? 'workflows.archived'
    : 'workflows';

  let onError: ErrorCallback;
  let error: string;

  if (parameters.query) {
    onError = (response) => {
      error = response.body.message;
    };
  }

  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(
      ApiRoutes[endpoint]({ namespace }),
      {
        params: { query },
        onError,
        request,
      },
    )) ?? { executions: [], nextPageToken: '' };

  return {
    workflows: toWorkflowExecutions({ executions }),
    nextPageToken: String(nextPageToken),
    error,
  };
};

export const fetchAllArchivedWorkflows = async (
  namespace: string,
  parameters: ArchiveFilterParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  return fetchAllWorkflows(namespace, parameters, request, true);
};

export async function fetchWorkflow(
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(ApiRoutes.workflow(parameters), { request }).then(
    toWorkflowExecution,
  );
}
