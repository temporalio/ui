import type {
  ActivityPauseRequest,
  ActivityPauseResponse,
  ActivityResetRequest,
  ActivityResetResponse,
  ActivityUnpauseRequest,
  ActivityUnpauseResponse,
  ActivityUpdateOptionsRequest,
  ActivityUpdateOptionsResponse,
} from '$lib/types';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type WorkflowInformation = {
  workflowId: string;
  runId: string;
  activityId: string;
};

export const pauseActivity = async ({
  namespace,
  execution,
  id,
  reason,
  type,
  identity,
}: ActivityPauseRequest & {
  reason?: string;
}): Promise<ActivityPauseResponse> => {
  const route = routeForApi('activity.pause', {
    namespace,
  });

  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        execution,
        reason,
        id,
        type,
        ...(identity && { identity }),
      }),
    },
  });
};

export const unpauseActivity = async ({
  namespace,
  execution,
  id,
  type,
  identity,
}: ActivityUnpauseRequest): Promise<ActivityUnpauseResponse> => {
  const route = routeForApi('activity.unpause', {
    namespace,
  });

  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        execution,
        id,
        type,
        ...(identity && { identity }),
      }),
    },
  });
};

export const resetActivity = async ({
  namespace,
  execution,
  id,
  type,
  resetHeartbeat,
  identity,
}: ActivityResetRequest): Promise<ActivityResetResponse> => {
  const route = routeForApi('activity.reset', {
    namespace,
  });

  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        execution,
        id,
        type,
        resetHeartbeat,
        ...(identity && { identity }),
      }),
    },
  });
};

export const updateActivityOptions = async ({
  namespace,
  execution,
  id,
  type,
  activityOptions,
  identity,
}: ActivityUpdateOptionsRequest): Promise<ActivityUpdateOptionsResponse> => {
  const route = routeForApi('activity.update-options', {
    namespace,
  });

  const fullMask =
    'taskQueue.name,scheduleToCloseTimeout,scheduleToStartTimeout,startToCloseTimeout,heartbeatTimeout,retryPolicy.initialInterval,retryPolicy.backoffCoefficient,retryPolicy.maximumInterval,retryPolicy.maximumAttempts';
  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        execution,
        id,
        type,
        activityOptions,
        updateMask: fullMask,
        ...(identity && { identity }),
      }),
    },
  });
};
