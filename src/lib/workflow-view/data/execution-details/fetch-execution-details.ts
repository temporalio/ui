import { toWorkflowExecution } from '$lib/models/workflow-execution';
import type {
  WorkflowExecution,
  WorkflowExecutionAPIResponse,
} from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { ExecutionIdentity } from '../identity-keys';

/** Fetches selected-execution details without updating legacy stores. */
export async function fetchExecutionDetails(
  identity: ExecutionIdentity,
  signal: AbortSignal,
): Promise<WorkflowExecution> {
  const response = await requestFromAPI<WorkflowExecutionAPIResponse>(
    routeForApi('workflow', identity),
    {
      params: { 'execution.runId': identity.runId },
      options: { signal },
      notifyOnError: false,
    },
  );

  if (!response?.workflowExecutionInfo) {
    throw new Error('Missing execution details response');
  }

  return toWorkflowExecution(response);
}
