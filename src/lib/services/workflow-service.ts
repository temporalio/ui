import { sub, formatISO } from 'date-fns';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';
import { toDuration } from '$lib/utilities/to-duration';

import type { ListWorkflowExecutionsResponse } from '$types';
import type { WorkflowExecution } from '$lib/models/workflow-execution';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageTokens: NextPageTokens;
};

type WorkflowType = 'open' | 'closed';
type VisibilityParameters = {
  timeRange?: Duration | string;
  status?: WorkflowStatus;
};

const createDate = (timeRange: Duration | string) => {
  const duration =
    typeof timeRange === 'string' ? toDuration(timeRange) : timeRange;
  return formatISO(sub(new Date(), duration));
};

export const fetchWorkflowsByType = (
  namespace: string,
  type: WorkflowType,
  { timeRange }: VisibilityParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  return requestFromAPI<ListWorkflowExecutionsResponse>(
    `/namespaces/${namespace}/workflows/${type}`,
    {
      params: {
        'start_time_filter.earliest_time': createDate(
          timeRange || { hours: 24 },
        ),
      },
      request,
    },
  );
};

export const fetchAllWorkflows = (
  namespace: string,
  parameters: VisibilityParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  return Promise.all([
    fetchWorkflowsByType(namespace, 'open', parameters, request),
    fetchWorkflowsByType(namespace, 'closed', parameters, request),
  ]).then(([open, closed]): CombinedWorkflowExecutionsResponse => {
    const executions = [...open?.executions, ...closed?.executions];
    return {
      workflows: toWorkflowExecutions({ executions }),
      nextPageTokens: {
        open: open.nextPageToken,
        closed: closed.nextPageToken,
      },
    };
  });
};

export async function fetchWorkflow(
  { executionId, runId, namespace }: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(
    `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
    { request },
  ).then(toWorkflowExecution);
}
