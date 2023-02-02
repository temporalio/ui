import { v4 as uuidv4 } from 'uuid';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { uiVersion } from '$lib/stores/versions';
import { get } from 'svelte/store';
import { isVersionNewer } from '$lib/utilities/version-check';

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

type CreateBatchOperationOptions = {
  namespace: string;
  reason: string;
};

type CreateBatchOperationWithQueryOptions = CreateBatchOperationOptions & {
  query: string;
};

type CreateBatchOperationWithIDsOptions = CreateBatchOperationOptions & {
  workflows: WorkflowExecution[];
};

type DescribeBatchOperationOptions = {
  jobId: string;
  namespace: string;
};

export async function bulkTerminateByIDs({
  namespace,
  reason,
  workflows,
}: CreateBatchOperationWithIDsOptions) {
  return terminateWorkflows(namespace, queryFromWorkflows(workflows), reason);
}

export async function batchTerminateByQuery({
  namespace,
  query,
  reason,
}: CreateBatchOperationWithQueryOptions) {
  return terminateWorkflows(namespace, query, reason);
}

export async function bulkCancelByIDs({
  namespace,
  workflows,
  reason,
}: CreateBatchOperationWithIDsOptions): Promise<string> {
  return cancelWorkflows(namespace, queryFromWorkflows(workflows), reason);
}

export async function batchCancelByQuery({
  namespace,
  query,
  reason,
}: CreateBatchOperationWithQueryOptions) {
  return cancelWorkflows(namespace, query, reason);
}

async function cancelWorkflows(
  namespace: string,
  query: string,
  reason: string,
): Promise<string> {
  const version = get(uiVersion);
  const routeId = isVersionNewer(version, '2.9.0')
    ? 'batch-operations'
    : 'workflows.batch.terminate';
  const route = routeForApi(routeId, { namespace });
  const jobId = uuidv4();

  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        jobId,
        namespace,
        visibilityQuery: query,
        reason,
        cancellationOperation: {},
      }),
    },
    shouldRetry: false,
    notifyOnError: false,
  });

  return jobId;
}

async function terminateWorkflows(
  namespace: string,
  query: string,
  reason: string,
): Promise<string> {
  const version = get(uiVersion);
  const routeId = isVersionNewer(version, '2.9.0')
    ? 'batch-operations'
    : 'workflows.batch.terminate';
  const route = routeForApi(routeId, { namespace });
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
  const version = get(uiVersion);
  const routeId = isVersionNewer(version, '2.9.0')
    ? 'batch-operation.describe'
    : 'workflows.batch.describe';
  const route = routeForApi(routeId, {
    namespace,
  });

  return requestFromAPI<BatchOperationInfo>(route, {
    params: { jobId },
  });
}
