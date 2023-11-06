import { get } from 'svelte/store';

import { Action } from '$lib/models/workflow-actions';
import { getAuthUser } from '$lib/stores/auth-user';
import { inProgressBatchOperation } from '$lib/stores/batch-operations';
import { temporalVersion } from '$lib/stores/versions';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { isVersionNewer } from '$lib/utilities/version-check';

import type {
  StartBatchOperationRequest,
  WorkflowExecutionInput,
} from '$types';
import type {
  APIBatchOperationInfo,
  BatchOperation,
  BatchOperationInfo,
  BatchOperations,
  DescribeBatchOperationResponse,
  ListBatchOperationsResponse,
} from '$types/batch';
import type { WorkflowExecution } from '$types/workflows';

type CreateBatchOperationOptions = {
  namespace: string;
  reason: string;
  jobId: string;
  query?: string;
  workflows?: WorkflowExecution[];
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

const batchActionToOperation = (
  action: Action,
): Pick<
  StartBatchOperationRequest,
  'cancellationOperation' | 'terminationOperation'
> => {
  const identity = getAuthUser().email;

  switch (action) {
    case Action.Cancel:
      return {
        cancellationOperation: { identity },
      };
    case Action.Terminate:
      return {
        terminationOperation: { identity },
      };
    default:
      return {};
  }
};

const toWorkflowExecutionInput = ({
  id,
  runId,
}: WorkflowExecution): WorkflowExecutionInput => ({ workflowId: id, runId });

const createBatchOperationRequest = (
  action: Action,
  options: CreateBatchOperationOptions,
): StartBatchOperationRequest => {
  const body: StartBatchOperationRequest = {
    jobId: options.jobId,
    namespace: options.namespace,
    reason: options.reason,
    ...batchActionToOperation(action),
  };

  if (options.workflows) {
    if (isVersionNewer(get(temporalVersion), '1.19')) {
      return {
        ...body,
        executions: options.workflows.map(toWorkflowExecutionInput),
      };
    } else {
      return {
        ...body,
        visibilityQuery: queryFromWorkflows(options.workflows),
      };
    }
  } else if (options.query) {
    return {
      ...body,
      visibilityQuery: options.query,
    };
  }
};

export async function batchCancelWorkflows(
  options: CreateBatchOperationOptions,
): Promise<void> {
  const route = routeForApi('batch-operations', {
    namespace: options.namespace,
    batchJobId: options.jobId,
  });

  const body: StartBatchOperationRequest = createBatchOperationRequest(
    Action.Cancel,
    options,
  );

  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
    },
    notifyOnError: false,
  });

  inProgressBatchOperation.set({
    jobId: body.jobId,
    namespace: body.namespace,
  });
}

export async function batchTerminateWorkflows(
  options: CreateBatchOperationOptions,
): Promise<void> {
  const route = routeForApi('batch-operations', {
    namespace: options.namespace,
    batchJobId: options.jobId,
  });

  const body = createBatchOperationRequest(Action.Terminate, options);

  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
    },
    notifyOnError: false,
  });

  inProgressBatchOperation.set({
    jobId: body.jobId,
    namespace: body.namespace,
  });
}

export async function pollBatchOperation({
  namespace,
  jobId,
}: DescribeBatchOperationOptions): Promise<number> {
  return new Promise<number>((resolve, reject) => {
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
          }, 5000);
        }
      },
    );
  });
}

export async function describeBatchOperation(
  { jobId, namespace }: DescribeBatchOperationOptions,
  request = fetch,
): Promise<BatchOperation> {
  const route = routeForApi('batch-operations', {
    namespace,
    batchJobId: jobId,
  });

  const response = await requestFromAPI<DescribeBatchOperationResponse>(route, {
    request,
  });

  return toBatchOperationDetails(response);
}

const toBatchOperationDetails = (
  apiBatchOperationDetails: DescribeBatchOperationResponse,
): BatchOperation => {
  return {
    ...apiBatchOperationDetails,
    startTime: apiBatchOperationDetails.startTime,
    closeTime: apiBatchOperationDetails.closeTime,
    totalOperationCount: parseInt(
      apiBatchOperationDetails.totalOperationCount,
      10,
    ),
    completeOperationCount: parseInt(
      apiBatchOperationDetails.completeOperationCount,
      10,
    ),
    failureOperationCount: parseInt(
      apiBatchOperationDetails.failureOperationCount,
      10,
    ),
  };
};

export async function listBatchOperations(
  namespace: string,
  request = fetch,
): Promise<BatchOperations> {
  const route = routeForApi('batch-operations.list', {
    namespace,
    batchJobId: '',
  });

  const response = await requestFromAPI<ListBatchOperationsResponse>(route, {
    request,
  });

  return {
    nextPageToken: response.nextPageToken,
    operations: response.operationInfo
      ? response.operationInfo.map(toBatchOperationInfo)
      : [],
  };
}

const toBatchOperationInfo = (
  apiBatchOperationInfo: APIBatchOperationInfo,
): BatchOperationInfo => {
  return {
    startTime: apiBatchOperationInfo.startTime,
    closeTime: apiBatchOperationInfo.closeTime,
    jobId: apiBatchOperationInfo.jobId,
    state: apiBatchOperationInfo.state,
  };
};
