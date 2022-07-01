import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { v4 as uuidv4 } from 'uuid';

import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type ScheduleParameters = {
  namespace: string;
  scheduleId: string;
};

export type ScheduleResponse = {
  schedules: WorkflowExecution[];
  nextPageToken: string;
  error?: string;
};

export type FetchSchedule = typeof fetchAllSchedules;

export const fetchAllSchedules = async (
  namespace: string,
  request = fetch,
): Promise<ScheduleResponse> => {
  const onError: ErrorCallback = (e) => console.error(e);
  let error: string;

  const { schedules, nextPageToken } = (await requestFromAPI<ScheduleResponse>(
    routeForApi('schedules', { namespace }),
    {
      params: {},
      onError,
      request,
    },
  )) ?? { schedules: [], nextPageToken: '' };

  return {
    schedules,
    nextPageToken: String(nextPageToken),
    error,
  };
};

export async function fetchSchedule(
  parameters: ScheduleParameters,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(routeForApi('schedule', parameters), { request });
}

export async function deleteSchedule(
  parameters: ScheduleParameters,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(routeForApi('schedule.delete', parameters), {
    options: { method: 'DELETE' },
  });
}

type CreateScheduleOptions = {
  namespace: string;
  request_id: string;
  body: unknown;
};

export async function createSchedule({
  namespace,
  body,
}: CreateScheduleOptions): Promise<null> {
  return await requestFromAPI<null>(
    routeForApi('schedules', {
      namespace,
    }),
    {
      options: {
        method: 'POST',
        body: JSON.stringify({
          request_id: uuidv4(),
          ...body,
        }),
      },
      shouldRetry: false,
      onError: (error) => console.error(error),
    },
  );
}

type EditScheduleOptions = {
  namespace: string;
  scheduleId: string;
  request_id: string;
  body: unknown;
};

export async function editSchedule({
  namespace,
  scheduleId,
  body,
}: EditScheduleOptions): Promise<null> {
  return await requestFromAPI<null>(
    routeForApi('schedule', {
      namespace,
      scheduleId,
    }),
    {
      options: {
        method: 'POST',
        body: JSON.stringify({
          request_id: uuidv4(),
          ...body,
        }),
      },
      shouldRetry: false,
      onError: (error) => console.error(error),
    },
  );
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

  return await requestFromAPI<null>(
    routeForApi('schedule', {
      namespace,
      scheduleId: scheduleId,
    }),
    {
      options: {
        method: 'POST',
        body: JSON.stringify({
          ...options,
          request_id: uuidv4(),
        }),
      },
      shouldRetry: false,
      onError: (error) => console.error(error),
    },
  );
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

  return await requestFromAPI<null>(
    routeForApi('schedule', {
      namespace,
      scheduleId: scheduleId,
    }),
    {
      options: {
        method: 'POST',
        body: JSON.stringify({
          ...options,
          request_id: uuidv4(),
        }),
      },
      shouldRetry: false,
    },
  );
}
