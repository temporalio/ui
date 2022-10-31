import { v4 as uuidv4 } from 'uuid';
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
  workflowExecutions: WorkflowExecution[];
  reason: string;
};

export async function batchTerminateWorkflows({
  namespace,
  workflowExecutions,
  reason,
}: BulkTerminateWorkflowOptions): Promise<null> {
  const route = await routeForApi('workflows.batch.terminate', { namespace });

  const runIds = workflowExecutions.map((wf) => wf.runId);
  const query = runIds.reduce((queryString, id, index, arr) => {
    queryString += `RunId="${id}"`;
    if (index !== arr.length - 1) {
      queryString += '+or+';
    }

    return queryString;
  }, '');

  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        jobId: uuidv4(),
        namespace,
        visibilityQuery: query,
        reason,
        terminationOperation: {},
      }),
    },
    shouldRetry: false,
    notifyOnError: false,
  });
}
