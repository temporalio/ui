import type { StandaloneActivityFormData } from '$lib/components/standalone-activity-form/types';
import type {
  ActivityType,
  Payload,
  Payloads,
  TaskQueue,
  UserMetadata,
} from '$lib/types';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

// TODO: Use @temporalio/proto once updated
type StartActivityExecutionRequest = {
  namespace: string;
  identity: string;
  requestId: string;
  activityId: string;
  activityType: ActivityType;
  taskQueue: TaskQueue;
  startToCloseTimeout: string;
  scheduleToCloseTimeout: string;
  scheduleToStartTimeout: string;
  input?: Payloads;
  userMetadata?: UserMetadata;
};

const toStartActivityExecutionRequest = async (
  activityFormData: StandaloneActivityFormData,
): Promise<StartActivityExecutionRequest> => {
  let inputPayloads: Payload[] | null = null;
  let summaryPayload: Payload | null = null;
  let detailsPayload: Payload | null = null;

  if (activityFormData.input) {
    const { input, encoding, messageType } = activityFormData;
    try {
      inputPayloads = await encodePayloads({ input, encoding, messageType });
    } catch {
      throw new Error('Could not encode input for starting activity execution');
    }
  }

  if (activityFormData.summary) {
    try {
      const payloads = await encodePayloads({
        input: stringifyWithBigInt(activityFormData.summary),
        encoding: 'json/plain',
      });

      if (payloads && payloads[0]) {
        summaryPayload = payloads[0];
      }
    } catch {
      throw new Error(
        'Could not encode summary for starting activity execution',
      );
    }
  }

  if (activityFormData.details) {
    try {
      const payloads = await encodePayloads({
        input: stringifyWithBigInt(activityFormData.details),
        encoding: 'json/plain',
      });

      if (payloads && payloads[0]) {
        detailsPayload = payloads[0];
      }
    } catch {
      throw new Error(
        'Could not encode details for starting activity execution',
      );
    }
  }

  return {
    identity: activityFormData.identity,
    namespace: activityFormData.namespace,
    activityId: activityFormData.activityId,
    requestId: crypto.randomUUID(),
    activityType: { name: activityFormData.activityType },
    taskQueue: { name: activityFormData.taskQueue },
    input: { payloads: inputPayloads },
    userMetadata: {
      summary: summaryPayload,
      details: detailsPayload,
    },
    ...(activityFormData.startToCloseTimeout && {
      startToCloseTimeout: activityFormData.startToCloseTimeout,
    }),
    ...(activityFormData.scheduleToCloseTimeout && {
      scheduleToCloseTimeout: activityFormData.scheduleToCloseTimeout,
    }),
    ...(activityFormData.scheduleToStartTimeout && {
      scheduleToStartTimeout: activityFormData.scheduleToStartTimeout,
    }),
  };
};

export const startStandaloneActivity = async (
  activity: StandaloneActivityFormData,
) => {
  const { activityId, namespace } = activity;

  const route = routeForApi('standalone-activities.start', {
    namespace,
    activityId,
  });

  const startActivityExecutionRequest =
    await toStartActivityExecutionRequest(activity);

  return requestFromAPI(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt(startActivityExecutionRequest),
    },
  });
};

export const getActivityExecutions = (namespace: string) => {
  const route = routeForApi('standalone-activities', { namespace });

  return requestFromAPI(route);
};
