import { get } from 'svelte/store';

import { Action } from '$lib/models/workflow-actions';
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
import type { WorkflowExecution } from '$types/workflows';

// https://github.com/temporalio/api/blob/master/temporal/api/enums/v1/reset.proto
enum ResetType {
  RESET_TYPE_FIRST_WORKFLOW_TASK = 1,
  RESET_TYPE_LAST_WORKFLOW_TASK = 2,
}

type CreateBatchOperationOptions = {
  namespace: string;
  reason: string;
  jobId: string;
  query?: string;
  workflows?: WorkflowExecution[];
  resetType?: 'first' | 'last';
  identity?: string;
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
  identity: string | undefined,
  resetType?: 'first' | 'last',
): StartBatchOperationRequest => {
  switch (action) {
    case Action.Cancel:
      return {
        cancellationOperation: { identity },
      };
    case Action.Terminate:
      return {
        terminationOperation: { identity },
      };
    case Action.Reset: {
      const options =
        resetType === 'first'
          ? { firstWorkflowTask: {} }
          : { lastWorkflowTask: {} };

      return {
        resetOperation: {
          identity,
          // options is a new field for server versions 1.23 and later
          options,
          // resetType is a deprecated field for server versions 1.23 and earlier
          resetType:
            resetType === 'first'
              ? ResetType.RESET_TYPE_FIRST_WORKFLOW_TASK
              : ResetType.RESET_TYPE_LAST_WORKFLOW_TASK,
        },
      };
    }
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
    ...batchActionToOperation(action, options.identity, options.resetType),
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

  return body;
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
    jobId: options.jobId,
    namespace: options.namespace,
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
    jobId: options.jobId,
    namespace: options.namespace,
  });
}

export const batchResetWorkflows = async (
  options: CreateBatchOperationOptions,
): Promise<void> => {
  const route = routeForApi('batch-operations', {
    namespace: options.namespace,
    batchJobId: options.jobId,
  });

  const body = createBatchOperationRequest(Action.Reset, options);

  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
    },
    notifyOnError: false,
  });

  inProgressBatchOperation.set({
    jobId: options.jobId,
    namespace: options.namespace,
  });
};
