import { v4 as uuidv4 } from 'uuid';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type { StartBatchOperationRequest } from 'src/types';

type CreateBatchOperationOptions = {
  namespace: string;
  reason: string;
  query?: string;
  executions?: { workflowId: string; runId: string }[];
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
  const executions = workflows.map(({ runId, id }) => ({
    runId,
    workflowId: id,
  }));
  return terminateWorkflows({ namespace, reason, executions });
}

export async function batchTerminateByQuery({
  namespace,
  query,
  reason,
}: CreateBatchOperationWithQueryOptions) {
  return terminateWorkflows({ namespace, query, reason });
}

export async function bulkCancelByIDs({
  namespace,
  workflows,
  reason,
}: CreateBatchOperationWithIDsOptions): Promise<string> {
  const executions = workflows.map(({ runId, id }) => ({
    runId,
    workflowId: id,
  }));
  return cancelWorkflows({ namespace, executions, reason });
}

export async function batchCancelByQuery({
  namespace,
  query,
  reason,
}: CreateBatchOperationWithQueryOptions) {
  return cancelWorkflows({ namespace, query, reason });
}

async function cancelWorkflows({
  namespace,
  query,
  executions,
  reason,
}: CreateBatchOperationOptions): Promise<string> {
  const route = routeForApi('batch-operations', { namespace });
  const jobId = uuidv4();

  const body: StartBatchOperationRequest = {
    jobId,
    namespace,
    reason,
    cancellationOperation: {},
    ...(query && { visibilityQuery: query }),
    ...(executions && { executions }),
  };

  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
    },
    shouldRetry: false,
    notifyOnError: false,
  });

  return jobId;
}

async function terminateWorkflows({
  namespace,
  query,
  executions,
  reason,
}: CreateBatchOperationOptions): Promise<string> {
  const route = routeForApi('batch-operations', { namespace });
  const jobId = uuidv4();

  const body: StartBatchOperationRequest = {
    jobId,
    namespace,
    reason,
    terminationOperation: {},
    ...(query && { visibilityQuery: query }),
    ...(executions && { executions }),
  };

  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
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
  const route = routeForApi('batch-operation.describe', {
    namespace,
  });

  return requestFromAPI<BatchOperationInfo>(route, {
    params: { jobId },
  });
}
