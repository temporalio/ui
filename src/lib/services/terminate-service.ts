import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type TerminateWorkflowOptions = {
  workflow: WorkflowExecution;
  namespace: string;
  reason: string;
};

export async function terminateWorkflow({
  workflow,
  namespace,
  reason,
}: TerminateWorkflowOptions): Promise<null> {
  const route = await routeForApi('workflow.terminate', {
    namespace,
    workflowId: workflow.id,
    runId: workflow.runId,
  });
  return await requestFromAPI<null>(route, {
    options: { method: 'POST', body: stringifyWithBigInt({ reason }) },
    shouldRetry: false,
    notifyOnError: false,
  });
}

type BulkTerminateWorkflowOptions = {
  namespace: string;
  query: string;
  reason: string;
};


export async function batchTerminateWorkflows({
  namespace,
  query,
  reason,
}: BulkTerminateWorkflowOptions): Promise<null> {
  const route = await routeForApi('workflows.batch.terminate', {
    namespace,
    query,
  });
  return await requestFromAPI<null>(route, {
    options: { method: 'POST', body: stringifyWithBigInt({ reason }) },
    params: { query },
    shouldRetry: false,
    notifyOnError: false,
  });
}

