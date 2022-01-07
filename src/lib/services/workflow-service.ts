import type { ListWorkflowExecutionsResponse } from '$types';
import type { WorkflowExecution } from '$lib/models/workflow-execution';

import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';

import { routeForApi } from '$lib/utilities/route-for-api';
import { getWorkflowFilterParameters } from '$lib/utilities/get-workflow-filter-parameters';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageTokens: NextPageTokens;
};

const emptyWorkflowRequest = (): Promise<ListWorkflowExecutionsResponse> => {
  return Promise.resolve({
    executions: [],
  });
};

const checkForStatus =
  (workflowStatus: WorkflowStatus, value: boolean) =>
  ({ status }: FilterParameters): boolean => {
    if (!status) return false;
    if (status === workflowStatus) return value;
    return !value;
  };

const filterIsSetToRunning = checkForStatus('Running', true);
const filterIsNotSetToRunning = checkForStatus('Running', false);

export const fetchOpenWorkflows = (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  if (filterIsNotSetToRunning(parameters)) return emptyWorkflowRequest();

  const params = getWorkflowFilterParameters(parameters);

  return requestFromAPI<ListWorkflowExecutionsResponse>(
    routeForApi('workflows.open', { namespace }),
    {
      params,
      request,
    },
  );
};

export const fetchClosedWorkflows = (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  if (filterIsSetToRunning(parameters)) return emptyWorkflowRequest();

  const params = getWorkflowFilterParameters(parameters);

  return requestFromAPI<ListWorkflowExecutionsResponse>(
    routeForApi('workflows.closed', { namespace }),
    {
      params,
      request,
    },
  );
};

export const fetchAllWorkflows = async (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const [open, closed] = await Promise.all([
    fetchOpenWorkflows(namespace, parameters, request),
    fetchClosedWorkflows(namespace, parameters, request),
  ]);

  const executions = [...open?.executions, ...closed?.executions];

  return {
    workflows: toWorkflowExecutions({ executions }),
    nextPageTokens: {
      open: open.nextPageToken,
      closed: closed.nextPageToken,
    },
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
