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

const queryFromWorkflows = (
  workflowExecutions: WorkflowExecution[],
): string => {
  const runIds = workflowExecutions.map((wf) => wf.runId);
  return runIds.reduce((queryString, id, index, arr) => {
    queryString += `RunId="${id}"`;
    if (index !== arr.length - 1) {
      queryString += ' OR ';
    }

    return queryString;
  }, '');
};

type BulkTerminateWorkflowOptions = {
  namespace: string;
  reason: string;
};

type BatchTerminateWorkflowByQueryOptions = BulkTerminateWorkflowOptions & {
  query: string;
};

type BulkTerminateWorkflowBySelectionOptions = BulkTerminateWorkflowOptions & {
  workflows: WorkflowExecution[];
};

export async function bulkTerminateBySelection({
  namespace,
  reason,
  workflows,
}: BulkTerminateWorkflowBySelectionOptions) {
  const query = queryFromWorkflows(workflows);
  return terminateWorkflows(namespace, query, reason);
}

export async function batchTerminateByQuery({
  namespace,
  query,
  reason,
}: BatchTerminateWorkflowByQueryOptions) {
  return terminateWorkflows(namespace, query, reason);
}

async function terminateWorkflows(
  namespace: string,
  query: string,
  reason: string,
): Promise<string> {
  const route = await routeForApi('workflows.batch.terminate', { namespace });
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
}: DescribeBatchOperationOptions): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    describeBatchOperation({ namespace, jobId }).then(
      ({ state, completeOperationCount }) => {
        if (state === 'Failed') {
          reject();
        } else if (state !== 'Running') {
          resolve(completeOperationCount);
        } else {
          setTimeout(() => {
            try {
              resolve(pollBatchOperation({ namespace, jobId }));
            } catch {
              reject();
            }
          }, 1000);
        }
      },
    );
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
