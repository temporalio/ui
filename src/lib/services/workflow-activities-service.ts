import { get } from 'svelte/store';

import { authUser } from '$lib/stores/auth-user';
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
import type {
  CompleteActivityTaskRequest,
  CompleteActivityTaskResponse,
  FailActivityTaskRequest,
  FailActivityTaskResponse,
} from '$lib/types/events';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type WorkflowInformation = {
  workflowId: string;
  runId: string;
  activityId: string;
};

export const failActivityTask = async ({
  namespace,
  workflowId,
  runId,
  activityId,
  failure,
  identity,
  lastHeartbeatDetails,
}: FailActivityTaskRequest &
  WorkflowInformation): Promise<FailActivityTaskResponse> => {
  const route = routeForApi('activity.fail', {
    namespace,
  });
  return requestFromAPI<FailActivityTaskResponse>(route, {
    notifyOnError: false,
    options: {
      body: stringifyWithBigInt({ failure, identity, lastHeartbeatDetails }),
    },
    params: {
      workflowId,
      runId,
      activityId,
    },
  });
};

export const completeActivityTask = async ({
  namespace,
  workflowId,
  runId,
  activityId,
  identity,
  result,
}: CompleteActivityTaskRequest &
  WorkflowInformation): Promise<CompleteActivityTaskResponse> => {
  const route = routeForApi('activity.complete', {
    namespace,
  });

  return requestFromAPI(route, {
    notifyOnError: false,
    options: { body: stringifyWithBigInt({ identity, result }) },
    params: {
      workflowId,
      runId,
      activityId,
    },
  });
};

const getIdentity = () => {
  const email = get(authUser)?.email;
  const identity = email ? `From the Web UI by ${email}` : 'From the Web UI';
  return identity;
};

export const pauseActivity = async ({
  namespace,
  execution,
  id,
  reason,
  type,
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
        identity: getIdentity(),
        id,
        type,
      }),
    },
  });
};

export const unpauseActivity = async ({
  namespace,
  execution,
  id,
  type,
}: ActivityUnpauseRequest): Promise<ActivityUnpauseResponse> => {
  const route = routeForApi('activity.unpause', {
    namespace,
  });

  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        execution,
        identity: getIdentity(),
        id,
        type,
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
}: ActivityResetRequest): Promise<ActivityResetResponse> => {
  const route = routeForApi('activity.reset', {
    namespace,
  });

  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        execution,
        identity: getIdentity(),
        id,
        type,
        resetHeartbeat,
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
}: ActivityUpdateOptionsRequest): Promise<ActivityUpdateOptionsResponse> => {
  const route = routeForApi('activity.update-options', {
    namespace,
  });

  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        execution,
        identity: getIdentity(),
        id,
        type,
        activityOptions,
      }),
    },
  });
};
