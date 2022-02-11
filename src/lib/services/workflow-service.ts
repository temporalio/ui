import type { ListWorkflowExecutionsResponse } from '$types';
import type { WorkflowExecution } from '$lib/models/workflow-execution';
import type { ErrorCallback } from '$lib/utilities/request-from-api';

import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';

import { routeForApi } from '$lib/utilities/route-for-api';
import { toListWorkflowQuery } from '$lib/utilities/list-workflow-query';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

export type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageToken: string;
  error?: string;
};

export const fetchAllWorkflows = async (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const query = parameters.query || toListWorkflowQuery(parameters);

  let onError: ErrorCallback;
  let error: string;

  if (parameters.query) {
    onError = (response) => {
      error = response.body.message;
    };
  }

  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(
      routeForApi('workflows', { namespace }),
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
  const query = parameters.query || toListWorkflowQuery(parameters);

  let onError: ErrorCallback;
  let error: string;

  if (parameters.query) {
    onError = (response) => {
      error = response.body.message;
    };
  }

  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(
      routeForApi('archive', { namespace }),
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

export async function fetchWorkflow(
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(routeForApi('workflow', parameters), { request }).then(
    toWorkflowExecution,
  );
}
