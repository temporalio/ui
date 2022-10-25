import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { v4 as uuidv4 } from 'uuid';

import type {
  ListScheduleResponse,
  DescribeScheduleResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleListEntry,
} from '$types';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

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

export const fetchAllSchedules = async (
  namespace: string,
  request = fetch,
): Promise<ScheduleResponse> => {
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `Error fetching schedules: ${err.status}: ${err.statusText}`);

  const route = await routeForApi('schedules', { namespace });
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
): Promise<DescribeScheduleResponse> {
  const route = await routeForApi('schedule', parameters);
  return requestFromAPI(route, { request });
}

export async function deleteSchedule(
  parameters: ScheduleParameters,
  request = fetch,
): Promise<void> {
  const route = await routeForApi('schedule.delete', parameters);
  return requestFromAPI(route, {
    request,
    options: { method: 'DELETE' },
  });
}

type CreateScheduleOptions = {
  namespace: string;
  body: CreateScheduleRequest;
};

export async function createSchedule({
  namespace,
  body,
}: CreateScheduleOptions): Promise<{ error: string; conflictToken: string }> {
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `Error creating schedule: ${err.status}: ${err.statusText}`);

  const route = await routeForApi('schedules', {
    namespace,
  });
  const { conflictToken } = await requestFromAPI<{ conflictToken: string }>(
    route,
    {
      options: {
        method: 'POST',
        body: stringifyWithBigInt({
          request_id: uuidv4(),
          ...body,
        }),
      },
      shouldRetry: false,
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
}: EditScheduleOptions): Promise<null> {
  const route = await routeForApi('schedule', {
    namespace,
    scheduleId,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        request_id: uuidv4(),
        ...body,
      }),
    },
    shouldRetry: false,
    onError: (error) => console.error(error),
  });
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
  const options = {
    patch: {
      pause: reason,
    },
  };

  const route = await routeForApi('schedule', {
    namespace,
    scheduleId: scheduleId,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'PATCH',
      body: stringifyWithBigInt({
        ...options,
        request_id: uuidv4(),
      }),
    },
    shouldRetry: false,
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
  const options = {
    patch: {
      unpause: reason,
    },
  };

  const route = await routeForApi('schedule', {
    namespace,
    scheduleId: scheduleId,
  });
  return await requestFromAPI<null>(route, {
    options: {
      method: 'PATCH',
      body: stringifyWithBigInt({
        ...options,
        request_id: uuidv4(),
      }),
    },
    shouldRetry: false,
  });
}
