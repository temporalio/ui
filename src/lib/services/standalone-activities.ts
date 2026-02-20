import type { StandaloneActivityFormData } from '$lib/components/standalone-activities/start-standalone-activity-form/types';
import { translate } from '$lib/i18n/translate';
import { activityError } from '$lib/stores/activities';
import type { Payload, SearchAttribute } from '$lib/types';
import type {
  ActivityExecution,
  ActivityExecutionInfo,
  StartActivityExecutionRequest,
} from '$lib/types/activity-execution';
import { encodePayloads } from '$lib/utilities/encode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import {
  type ErrorCallback,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import { setSearchAttributes } from './workflow-service';

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
      handleError: onError,
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
