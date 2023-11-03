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
}: CompleteActivityTaskRequest &
  WorkflowInformation): Promise<CompleteActivityTaskResponse> => {
  const route = routeForApi('activity.complete', {
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
