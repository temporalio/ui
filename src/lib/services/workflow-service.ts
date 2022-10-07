import type { ErrorCallback } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';

import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
import { handleUnauthorizedOrForbiddenError } from '$lib/utilities/handle-error';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  workflowId: string;
  runId: string;
};

export type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageToken: string;
  count?: number;
  error?: string;
};

export type FetchWorkflow =
  | typeof fetchAllWorkflows
  | typeof fetchAllArchivedWorkflows;

export const fetchAllWorkflows = async (
  namespace: string,
  parameters: ValidWorkflowParameters,
  request = fetch,
  archived = false,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const query = decodeURIComponent(
    parameters.query || toListWorkflowQuery(parameters, archived),
  );

  const endpoint: ValidWorkflowEndpoints = archived
    ? 'workflows.archived'
    : 'workflows';

  let error = '';
  const onError: ErrorCallback = (err) => {
    // Kick out to login if 401/403
    handleUnauthorizedOrForbiddenError(err);
    if (err?.body?.message || err?.status) {
      error =
        err?.body?.message ??
        `Error fetching workflows: ${err.status}: ${err.statusText}`;
    } else {
      error = `Error fetching workflows: Server failed to respond`;
    }
  };

  const route = await routeForApi(endpoint, { namespace });
  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(route, {
      params: { query },
      onError,
      handleError: onError,
      request,
    })) ?? { executions: [], nextPageToken: '' };

  let count = 0;
  try {
    const countRoute = await routeForApi('workflows.count', { namespace });
    const countResult =
      (await requestFromAPI<{ count: number }>(countRoute, {
        params: { query },
        onError,
        handleError: onError,
        request,
      })) ?? { count: 0 };
    count = countResult.count
  } catch (e) {
    // Don't fail the workflows call due to count
  }

  return {
    workflows: toWorkflowExecutions({ executions }),
    count,
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
  const route = await routeForApi('workflow', parameters);
  return requestFromAPI(route, { request }).then(toWorkflowExecution);
}
