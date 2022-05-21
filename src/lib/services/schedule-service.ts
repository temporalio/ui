import type { ErrorCallback } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';

import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  workflowId: string;
  runId: string;
};

export type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageToken: string;
  error?: string;
};

export type FetchWorkflow =
  | typeof fetchAllSchedules

export const fetchAllSchedules = async (
  namespace: string,
  parameters: ValidWorkflowParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {

  let onError: ErrorCallback;
  let error: string;

  const { schedules, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(
      routeForApi('schedules', { namespace }),
      {
        params: {},
        onError,
        request,
      },
    )) ?? { schedules: [], nextPageToken: '' };

  return {
    schedules,
    nextPageToken: String(nextPageToken),
    error,
  };
};

export async function fetchSchedule(
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(routeForApi('schedule', parameters), { request }).then(
    toWorkflowExecution,
  );
}
