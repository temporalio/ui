import { Action } from '$lib/models/workflow-actions';
import { getAuthUser } from '$lib/stores/auth-user';
import { inProgressBatchOperation } from '$lib/stores/batch-operations';
import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type CreateActivityBatchOperationOptions = {
  namespace: string;
  reason: string;
  jobId: string;
  query?: string;
  activities?: ActivityExecutionInfo[];
};

interface StartActivityBatchOperationRequest {
  jobId: string;
  namespace: string;
  reason: string;
  visibilityQuery?: string;
  executions?: { activityId: string; runId: string }[];
  cancellationOperation?: { identity: string };
  terminationOperation?: { identity: string };
}

const activityActionToOperation = (
  action: Action,
): Partial<StartActivityBatchOperationRequest> => {
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

const toActivityExecutionInput = ({
  activityId,
  runId,
}: ActivityExecutionInfo) => ({ activityId, runId });

const createActivityBatchOperationRequest = (
  action: Action,
  options: CreateActivityBatchOperationOptions,
): StartActivityBatchOperationRequest => {
  const body: StartActivityBatchOperationRequest = {
    jobId: options.jobId,
    namespace: options.namespace,
    reason: options.reason,
    ...activityActionToOperation(action),
  };

  if (options.activities) {
    return {
      ...body,
      executions: options.activities.map(toActivityExecutionInput),
    };
  } else if (options.query) {
    return {
      ...body,
      visibilityQuery: options.query,
    };
  }

  return body;
};

export async function batchCancelActivities(
  options: CreateActivityBatchOperationOptions,
): Promise<void> {
  const route = routeForApi('batch-operations', {
    namespace: options.namespace,
    batchJobId: options.jobId,
  });

  const body = createActivityBatchOperationRequest(Action.Cancel, options);

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

export async function batchTerminateActivities(
  options: CreateActivityBatchOperationOptions,
): Promise<void> {
  const route = routeForApi('batch-operations', {
    namespace: options.namespace,
    batchJobId: options.jobId,
  });

  const body = createActivityBatchOperationRequest(Action.Terminate, options);

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
