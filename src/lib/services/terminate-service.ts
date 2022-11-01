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
}: BulkTerminateWorkflowOptions): Promise<string> {
  const route = await routeForApi('workflows.batch.terminate', { namespace });

  const runIds = workflowExecutions.map((wf) => wf.runId);
  const query = runIds.reduce((queryString, id, index, arr) => {
    queryString += `RunId="${id}"`;
    if (index !== arr.length - 1) {
      queryString += ' OR ';
    }

    return queryString;
  }, '');

  const jobId = uuidv4();

  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        jobId,
        namespace,
        visibilityQuery: query,
        reason,
        terminationOperation: {},
      }),
    },
    shouldRetry: false,
    notifyOnError: false,
  });

  return jobId;
}

type DescribeBatchOperationOptions = {
  jobId: string;
  namespace: string;
};

export async function pollBatchOperation({
  namespace,
  jobId,
}: DescribeBatchOperationOptions) {
  return new Promise<void>(async (resolve, reject) => {
    const { state } = await describeBatchOperation({ namespace, jobId });
    if (state === 'Failed') {
      reject();
    } else if (state !== 'Running') {
      resolve();
    } else {
      setTimeout(async () => {
        try {
          resolve(pollBatchOperation({ namespace, jobId }));
        } catch {
          reject();
        }
      }, 1000);
    }
  });
}

async function describeBatchOperation({
  jobId,
  namespace,
}: DescribeBatchOperationOptions): Promise<BatchOperationInfo> {
  const route = await routeForApi('workflows.batch.describe', { namespace });

  return requestFromAPI<BatchOperationInfo>(route, {
    params: { jobId },
  });
}
