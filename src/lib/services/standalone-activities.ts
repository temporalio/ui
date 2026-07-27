import type { StandaloneActivityFormData } from '$lib/components/standalone-activities/start-standalone-activity-form/types';
import {
  type DefaultUnits,
  getFirstWholeNumberUnit,
  HOURS,
  MILLISECONDS,
  MINUTES,
  SECONDS,
  type Units,
} from '$lib/holocene/duration-input/duration-input.svelte';
import { translate } from '$lib/i18n/translate';
import {
  isPayloadInputEncodingType,
  type PayloadInputEncoding,
} from '$lib/models/payload-encoding';
import { activityError } from '$lib/stores/activities';
import type { Payload, SearchAttribute } from '$lib/types';
import type {
  ActivityExecution,
  ActivityExecutionInfo,
  StartActivityExecutionRequest,
} from '$lib/types/activity-execution';
import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import {
  type ErrorCallback,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { setSearchAttributes } from './workflow-service';

// Timeout duration inputs on the activity forms; largest-first so
// getFirstWholeNumberUnit resolves to the coarsest whole unit, defaulting to
// seconds when there is no value.
export const TIMEOUT_UNITS: Units<DefaultUnits> = [
  HOURS,
  MINUTES,
  SECONDS,
  MILLISECONDS,
];

export const initialTimeoutUnit = (
  duration: string,
): DefaultUnits | undefined =>
  getFirstWholeNumberUnit(duration, TIMEOUT_UNITS, SECONDS.label);

export type ListActivitiesResponse = {
  executions: ActivityExecutionInfo[];
  nextPageToken: string;
};

export interface StartStandaloneActivityResponse {
  runId: string;
  started: boolean;
}

export type PaginatedActivitiesPromise = (
  pageSize?: number,
  token?: string,
) => Promise<{ items: ActivityExecutionInfo[]; nextPageToken: string }>;

export const fetchPaginatedActivities = async (
  namespace: string,
  query: string = '',
  request = fetch,
): Promise<PaginatedActivitiesPromise> => {
  return (pageSize = 100, token = '') => {
    activityError.set('');

    const onError: ErrorCallback = (err) => {
      activityError.set(
        err?.body?.message ||
          translate('standalone-activities.activities-error-querying'),
      );
    };

    const route = routeForApi('standalone-activities', { namespace });

    return requestFromAPI<ListActivitiesResponse>(route, {
      params: {
        pageSize: String(pageSize),
        nextPageToken: token,
        ...(query ? { query } : {}),
      },
      request,
      onError,
    }).then((response) => {
      const { executions = [], nextPageToken = '' } = response || {};
      return {
        items: executions,
        nextPageToken: nextPageToken ? String(nextPageToken) : '',
      };
    });
  };
};

const toStartActivityExecutionRequest = async (
  activityFormData: StandaloneActivityFormData,
): Promise<StartActivityExecutionRequest> => {
  let inputPayloads: Payload[] | null = null;
  let summaryPayload: Payload | null = null;
  let detailsPayload: Payload | null = null;
  let searchAttributes: SearchAttribute | undefined = undefined;

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
): Promise<StartStandaloneActivityResponse> => {
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

interface ActivityInputValues {
  input: string;
  encoding: PayloadInputEncoding;
  messageType: string;
}

const extractInputValues = async (
  payloads: Payload[] | null | undefined,
): Promise<ActivityInputValues> => {
  const defaults: ActivityInputValues = {
    input: '',
    encoding: 'json/plain',
    messageType: '',
  };

  const payload = payloads?.[0];
  if (!payload) return defaults;

  const decoded = await decodePayloadAndParseDataToJSON(payload, false);
  if (!decoded) return defaults;

  const encodingValue = decoded.metadata?.encoding;
  return {
    input: decoded.data ? stringifyWithBigInt(decoded.data) : '',
    encoding:
      encodingValue && isPayloadInputEncodingType(encodingValue)
        ? encodingValue
        : 'json/plain',
    messageType: decoded.metadata?.messageType ?? '',
  };
};

const extractMetadataString = async (
  payload: Payload | null | undefined,
): Promise<string> => {
  if (!payload) return '';
  const decoded = await decodePayloadAndParseDataToJSON(payload);
  return typeof decoded === 'string' ? decoded : '';
};

export interface ActivityInitialValues {
  input: string;
  encoding: PayloadInputEncoding;
  messageType: string;
  summary: string;
  details: string;
  searchAttributes: Record<string, string | Payload> | undefined;
}

export const fetchInitialValuesForStartActivity = async (
  namespace: string,
  activityId: string,
  runId: string,
): Promise<ActivityInitialValues> => {
  const emptyValues: ActivityInitialValues = {
    input: '',
    encoding: 'json/plain',
    messageType: '',
    summary: '',
    details: '',
    searchAttributes: undefined,
  };

  try {
    const activity = await getActivityExecution(namespace, activityId, runId);
    const { input, encoding, messageType } = await extractInputValues(
      activity.input?.payloads,
    );
    const summary = await extractMetadataString(
      activity.info.userMetadata?.summary,
    );
    const details = await extractMetadataString(
      activity.info.userMetadata?.details,
    );

    return {
      input,
      encoding,
      messageType,
      summary,
      details,
      searchAttributes: activity.info.searchAttributes?.indexedFields,
    };
  } catch {
    return emptyValues;
  }
};

export const getActivityExecutions = (namespace: string) => {
  const route = routeForApi('standalone-activities', { namespace });

  return requestFromAPI(route);
};

export const getActivityExecution = (
  namespace: string,
  activityId: string,
  runId: string,
): Promise<ActivityExecution> => {
  const route = routeForApi('standalone-activity', {
    namespace,
    activityId,
  });

  const params = new URLSearchParams({
    includeInput: 'true',
    includeOutcome: 'true',
    includeHeartbeatDetails: 'true',
    includeLastFailure: 'true',
    runId,
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
    includeHeartbeatDetails: 'true',
    includeLastFailure: 'true',
    runId,
    longPollToken: token,
  });

  return requestFromAPI(route, {
    params,
    notifyOnError: false,
    options: { signal },
  });
};

export const cancelActivityExecution = async (
  namespace: string,
  activityId: string,
  runId: string,
  identity?: string,
): Promise<void> => {
  const route = routeForApi('standalone-activity.cancel', {
    namespace,
    activityId,
  });

  const body = {
    namespace,
    activityId,
    runId,
    requestId: crypto.randomUUID(),
    ...(identity && { identity }),
  };

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt(body),
    },
  });
};

export const terminateActivityExecution = async (
  namespace: string,
  activityId: string,
  runId: string,
  reason?: string,
  identity?: string,
): Promise<void> => {
  const route = routeForApi('standalone-activity.terminate', {
    namespace,
    activityId,
  });

  return requestFromAPI(route, {
    notifyOnError: false,
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        runId,
        reason: reason || '',
        ...(identity && { identity }),
      }),
    },
  });
};
