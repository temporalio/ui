import { v4 as uuidv4 } from 'uuid';
import { get } from 'svelte/store';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type {
  StartBatchOperationRequest,
  WorkflowExecutionInput,
} from 'src/types';
import { isVersionNewer } from '$lib/utilities/version-check';
import { temporalVersion } from '$lib/stores/versions';
import { toaster } from '$lib/stores/toaster';

type CreateBatchOperationOptions = {
  namespace: string;
  reason: string;
  query?: string;
  executions?: WorkflowExecutionInput[];
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

const toWorkflowExecutionInput = ({
  id,
  runId,
}: WorkflowExecution): WorkflowExecutionInput => ({ workflowId: id, runId });

const createBatchOperationOptions = ({
  namespace,
  reason,
  workflows,
}: CreateBatchOperationWithIDsOptions): CreateBatchOperationOptions => {
  const options: CreateBatchOperationOptions = {
    namespace,
    reason,
  };

  if (isVersionNewer(get(temporalVersion), '1.19')) {
    return {
      ...options,
      executions: workflows.map(toWorkflowExecutionInput),
    };
  } else {
    return {
      ...options,
      query: queryFromWorkflows(workflows),
    };
  }
};

export async function bulkTerminateByIDs(
  options: CreateBatchOperationWithIDsOptions,
): Promise<void> {
  try {
    const fullOptions = createBatchOperationOptions(options);
    const jobId = await terminateWorkflows(fullOptions);
    const workflowsTerminated = await pollBatchOperation({
      namespace: fullOptions.namespace,
      jobId,
    });
    toaster.push({
      message: `Successfully terminated ${workflowsTerminated} workflows.`,
      id: 'batch-terminate-success-toast',
    });
  } catch {
    toaster.push({
      message: 'Unable to terminate Workflows.',
      variant: 'error',
    });
  }
}

export async function batchTerminateByQuery({
  namespace,
  query,
  reason,
}: CreateBatchOperationWithQueryOptions): Promise<void> {
  try {
    await terminateWorkflows({ namespace, query, reason });
    toaster.push({
      message: 'The batch terminate request is processing in the background.',
      id: 'batch-terminate-success-toast',
    });
  } catch {
    toaster.push({
      message: 'Unable to terminate Workflows.',
      variant: 'error',
    });
  }
}

export async function bulkCancelByIDs(
  options: CreateBatchOperationWithIDsOptions,
): Promise<void> {
  try {
    const fullOptions = createBatchOperationOptions(options);
    const jobId = await cancelWorkflows(fullOptions);
    const workflowsCancelled = await pollBatchOperation({
      namespace: fullOptions.namespace,
      jobId,
    });
    toaster.push({
      message: `Successfully cancelled ${workflowsCancelled} workflows.`,
      id: 'batch-cancel-success-toast',
    });
  } catch {
    toaster.push({
      message: 'Unable to cancel Workflows.',
      variant: 'error',
    });
  }
}

export async function batchCancelByQuery({
  namespace,
  query,
  reason,
}: CreateBatchOperationWithQueryOptions): Promise<void> {
  try {
    await cancelWorkflows({ namespace, query, reason });
    toaster.push({
      message: 'The batch cancel request is processing in the background.',
      id: 'batch-cancel-success-toast',
    });
  } catch {
    toaster.push({
      message: 'Unable to cancel Workflows.',
      variant: 'error',
    });
  }
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
