import { get } from 'svelte/store';

import { v4 as uuidv4 } from 'uuid';

import { translate } from '$lib/i18n/translate';
import { authUser } from '$lib/stores/auth-user';
import type {
  CreateScheduleRequest,
  ListScheduleResponse,
  ScheduleListEntry,
  UpdateScheduleRequest,
} from '$lib/types';
import type { DescribeFullSchedule, OverlapPolicy } from '$lib/types/schedule';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type ScheduleParameters = {
  namespace: string;
  scheduleId: string;
};

export type ScheduleResponse = {
  schedules: ScheduleListEntry[];
  nextPageToken: string;
  error?: string;
};

export type FetchSchedule = typeof fetchAllSchedules;

type PaginatedSchedulesPromise = (
  pageSize: number,
  token: string,
) => Promise<{ items: ScheduleListEntry[]; nextPageToken: string }>;

export const fetchPaginatedSchedules = async (
  namespace: string,
  query: string,
  onError: ErrorCallback,
  request = fetch,
): Promise<PaginatedSchedulesPromise> => {
  return (pageSize = 100, token = '') => {
    const route = routeForApi('schedules', { namespace });
    return requestFromAPI<ListScheduleResponse>(route, {
      params: {
        maximumPageSize: String(pageSize),
        nextPageToken: token,
        ...(query ? { query } : {}),
      },
      request,
      onError,
    }).then(({ schedules, nextPageToken }) => {
      return {
        items: schedules,
        nextPageToken: nextPageToken ? String(nextPageToken) : '',
      };
    });
  };
};

export const fetchAllSchedules = async (
  namespace: string,
  request = fetch,
): Promise<ScheduleResponse> => {
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `${translate('schedules.error-message-fetching')}: ${err.status}: ${
        err.statusText
      }`);

  const route = routeForApi('schedules', { namespace });
  const { schedules, nextPageToken } =
    (await requestFromAPI<ListScheduleResponse>(route, {
      params: {},
      onError,
      request,
    })) ?? { schedules: [], nextPageToken: '' };

  return {
    schedules,
    nextPageToken: String(nextPageToken),
    error,
  };
};

export async function fetchSchedule(
  parameters: ScheduleParameters,
  request = fetch,
): Promise<DescribeFullSchedule> {
  const route = routeForApi('schedule', parameters);
  return requestFromAPI(route, { request });
}

export async function deleteSchedule(
  parameters: ScheduleParameters,
  request = fetch,
): Promise<void> {
  const identity = get(authUser).email;
  const route = routeForApi('schedule', parameters);
  return requestFromAPI(route, {
    request,
    options: { method: 'DELETE' },
    params: identity ? { identity } : {},
  });
}

type CreateScheduleOptions = {
  namespace: string;
  scheduleId: string;
  body: CreateScheduleRequest;
};

export async function createSchedule({
  namespace,
  scheduleId,
  body,
}: CreateScheduleOptions): Promise<{ error: string; conflictToken: string }> {
  const identity = get(authUser).email;
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `Error creating schedule: ${err.status}: ${err.statusText}`);

  const route = routeForApi('schedule', {
    namespace,
    scheduleId,
  });
  const { conflictToken } = await requestFromAPI<{ conflictToken: string }>(
    route,
    {
      options: {
        method: 'POST',
        body: stringifyWithBigInt({
          request_id: uuidv4(),
          ...body,
          ...(identity ? { identity } : {}),
        }),
      },
      onError,
    },
  );

  return { conflictToken, error };
}

type EditScheduleOptions = {
  namespace: string;
  scheduleId: string;
  request_id: string;
  body: UpdateScheduleRequest;
};

export async function editSchedule({
  namespace,
  scheduleId,
  body,
}: Partial<EditScheduleOptions>): Promise<{ error: string }> {
  const identity = get(authUser).email;
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `Error editing schedule: ${err.status}: ${err.statusText}`);

  const route = routeForApi('schedule.edit', {
    namespace,
    scheduleId,
  });
  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        request_id: uuidv4(),
        ...body,
        ...(identity ? { identity } : {}),
      }),
    },
    onError,
  });

  return { error };
}

type PauseScheduleOptions = {
  namespace: string;
  scheduleId: string;
  reason: string;
};

export async function pauseSchedule({
  namespace,
  scheduleId,
  reason,
}: PauseScheduleOptions): Promise<null> {
  const identity = get(authUser).email;
  const options = {
    patch: {
      pause: reason,
    },
  };

  const route = routeForApi('schedule.patch', {
    namespace,
    scheduleId: scheduleId,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        ...options,
        request_id: uuidv4(),
        ...(identity ? { identity } : {}),
      }),
    },
    onError: (error) => console.error(error),
  });
}

type UnpauseScheduleOptions = {
  namespace: string;
  scheduleId: string;
  reason: string;
};

export async function unpauseSchedule({
  namespace,
  scheduleId,
  reason,
}: UnpauseScheduleOptions): Promise<null> {
  const identity = get(authUser).email;
  const options = {
    patch: {
      unpause: reason,
    },
  };

  const route = routeForApi('schedule.patch', {
    namespace,
    scheduleId: scheduleId,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        ...options,
        request_id: uuidv4(),
        ...(identity ? { identity } : {}),
      }),
    },
  });
}

type TriggerImmediatelyOptions = {
  namespace: string;
  scheduleId: string;
  overlapPolicy: OverlapPolicy;
};

export async function triggerImmediately({
  namespace,
  scheduleId,
  overlapPolicy,
}: TriggerImmediatelyOptions): Promise<null> {
  const identity = get(authUser).email;
  const options = {
    patch: {
      triggerImmediately: {
        overlapPolicy,
      },
    },
  };

  const route = routeForApi('schedule.patch', {
    namespace,
    scheduleId: scheduleId,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        ...options,
        request_id: uuidv4(),
        ...(identity ? { identity } : {}),
      }),
    },
  });
}

type BackfillOptions = TriggerImmediatelyOptions & {
  startTime: string;
  endTime: string;
};

export async function backfillRequest({
  namespace,
  scheduleId,
  overlapPolicy,
  startTime,
  endTime,
}: BackfillOptions): Promise<null> {
  const identity = get(authUser).email;
  const options = {
    patch: {
      backfillRequest: [
        {
          overlapPolicy,
          startTime,
          endTime,
        },
      ],
    },
  };

  const route = routeForApi('schedule.patch', {
    namespace,
    scheduleId: scheduleId,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        ...options,
        request_id: uuidv4(),
        ...(identity ? { identity } : {}),
      }),
    },
  });
}
