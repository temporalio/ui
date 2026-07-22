import { getAuthUser } from '$lib/stores/auth-user';
import { inProgressBatchOperation } from '$lib/stores/batch-operations';
import { type Execution, ExecutionType } from '$lib/types';
import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type ActivityBatchAction = 'cancel' | 'terminate';

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
  targetExecutions?: Execution[];
  cancelActivitiesOperation?: { identity: string; reason: string };
  terminateActivitiesOperation?: { identity: string; reason: string };
}

const activityActionToOperation = (
  action: ActivityBatchAction,
  reason: string,
): Partial<StartActivityBatchOperationRequest> => {
  const identity = getAuthUser().email ?? '';

  switch (action) {
    case 'cancel':
      return {
        cancelActivitiesOperation: { identity, reason },
      };
    case 'terminate':
      return {
        terminateActivitiesOperation: { identity, reason },
      };
    default:
      return {};
  }
};

const toTargetExecution = ({
  activityId,
  runId,
}: ActivityExecutionInfo): Execution => ({
  type: ExecutionType.EXECUTION_TYPE_ACTIVITY,
  businessId: activityId ?? '',
  runId: runId ?? '',
});

const createActivityBatchOperationRequest = (
  action: ActivityBatchAction,
  options: CreateActivityBatchOperationOptions,
): StartActivityBatchOperationRequest => {
  const body: StartActivityBatchOperationRequest = {
    jobId: options.jobId,
    namespace: options.namespace,
    reason: options.reason,
    ...activityActionToOperation(action, options.reason),
  };

  if (options.activities) {
    return {
      ...body,
      targetExecutions: options.activities.map(toTargetExecution),
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

  const body = createActivityBatchOperationRequest('cancel', options);

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

  const body = createActivityBatchOperationRequest('terminate', options);

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
