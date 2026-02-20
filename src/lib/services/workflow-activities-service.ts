import { page } from '$app/state';

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
import { isNotFound, isNotImplemented } from '$lib/utilities/handle-error';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { minimumVersionRequired } from '$lib/utilities/version-check';

const requestWithActivityFallback = async <T>(
  route: string,
  init: Parameters<typeof requestFromAPI>[1],
): Promise<T> => {
  const fallbackRoute = route.replace(
    '/activities-deprecated/',
    '/activities/',
  );
  const version = page.data?.settings?.version;

  if (version && !minimumVersionRequired('2.45.3', version)) {
    return requestFromAPI<T>(fallbackRoute, init);
  }

  try {
    return await requestFromAPI<T>(route, {
      ...init,
      notifyOnError: false,
    });
  } catch (error: unknown) {
    if (isNotImplemented(error) || isNotFound(error)) {
      return requestFromAPI<T>(fallbackRoute, init);
    }

    throw error;
  }
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

  return requestWithActivityFallback(route, {
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

  return requestWithActivityFallback(route, {
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

  return requestWithActivityFallback(route, {
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
  return requestWithActivityFallback(route, {
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
