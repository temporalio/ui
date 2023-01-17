import { routeForApi } from '$lib/utilities/route-for-api';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import type {
  FailActivityTaskRequest,
  FailActivityTaskResponse,
  CompleteActivityTaskRequest,
  CompleteActivityTaskResponse,
} from '$types';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

export const failActivityTask = async ({
  namespace,
  workflowId,
  runId,
  activityId,
  failure,
  identity,
  lastHeartbeatDetails,
}: FailActivityTaskRequest): Promise<FailActivityTaskResponse> => {
  const route = await routeForApi('activity.fail', {
    namespace,
    workflowId,
    runId,
    activityId,
  });
  return requestFromAPI<FailActivityTaskResponse>(route, {
    notifyOnError: false,
    options: {
      body: stringifyWithBigInt({ failure, identity, lastHeartbeatDetails }),
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
}: CompleteActivityTaskRequest): Promise<CompleteActivityTaskResponse> => {
  const route = await routeForApi('activity.complete', {
    namespace,
    workflowId,
    runId,
    activityId,
  });

  return requestFromAPI(route, {
    notifyOnError: false,
    options: { body: stringifyWithBigInt({ identity, result }) },
  });
};
