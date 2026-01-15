import type { StandaloneActivityFormData } from '$lib/components/activity-execution-form/types';
import type {
  ActivityType,
  Payload,
  Payloads,
  RetryPolicy,
  SearchAttribute,
  TaskQueue,
  UserMetadata,
} from '$lib/types';
import type { ActivityExecution } from '$lib/types/activity-execution';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { setSearchAttributes } from './workflow-service';

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
  retryPolicy?: RetryPolicy;
  searchAttributes?: SearchAttribute;
};

const toStartActivityExecutionRequest = async (
  activityFormData: StandaloneActivityFormData,
): Promise<StartActivityExecutionRequest> => {
  let inputPayloads: Payload[] | null = null;
  let summaryPayload: Payload | null = null;
  let detailsPayload: Payload | null = null;
  let searchAttributes: SearchAttribute | null = null;

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

  if (activityFormData.searchAttributes) {
    searchAttributes = {
      indexedFields: {
        ...setSearchAttributes(activityFormData.searchAttributes),
      },
    };
  }

  console.table({
    summary: activityFormData.summary,
    details: activityFormData.details,
    summaryPayload,
    detailsPayload,
  });

  return {
    identity: activityFormData.identity,
    namespace: activityFormData.namespace,
    activityId: activityFormData.activityId,
    requestId: crypto.randomUUID(),
    activityType: { name: activityFormData.activityType },
    taskQueue: { name: activityFormData.taskQueue },
    input: { payloads: inputPayloads },
    searchAttributes,
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
    retryPolicy: {
      ...(activityFormData.initialInterval && {
        initialInterval: activityFormData.initialInterval,
      }),
      ...(activityFormData.maximumInterval && {
        maximumInterval: activityFormData.maximumInterval,
      }),
      ...(activityFormData.maximumAttempts && {
        maximumAttempts: Number(activityFormData.maximumAttempts),
      }),
      ...(activityFormData.backoffCoefficient && {
        backoffCoefficient: Number(activityFormData.backoffCoefficient),
      }),
    },
  };
};

export const startStandaloneActivity = async (
  activity: StandaloneActivityFormData,
) => {
  const { activityId, namespace } = activity;

  const route = routeForApi('standalone-activity', {
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

export const getActivityExecution = (
  namespace: string,
  activityId: string,
): Promise<ActivityExecution> => {
  const route = routeForApi('standalone-activity', {
    namespace,
    activityId,
  });

  const params = new URLSearchParams({
    includeInput: 'true',
    includeOutcome: 'true',
  });

  return requestFromAPI(route, {
    params,
  });
};

export const pollActivityExecution = (
  namespace: string,
  activityId: string,
  runId: string,
  token: string,
  signal: AbortSignal,
): Promise<ActivityExecution> => {
  const route = routeForApi('standalone-activity', {
    namespace,
    activityId,
  });

  const params = new URLSearchParams({
    includeInput: 'false',
    includeOutcome: 'true',
    runId,
    longPollToken: token,
  });

  return requestFromAPI(route, { params, signal });
};
