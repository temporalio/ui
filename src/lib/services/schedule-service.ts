import type { ErrorCallback } from '$lib/utilities/request-from-api';

import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  workflowId: string;
  runId: string;
};

export type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageToken: string;
  error?: string;
};

export type FetchWorkflow = typeof fetchAllSchedules;

export const fetchAllSchedules = async (
  namespace: string,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  let onError: ErrorCallback;
  let error: string;

  const { schedules, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(
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
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(routeForApi('schedule', parameters), { request });
}

type PauseScheduleOptions = {
  namespace: string;
  scheduleId: string;
  pause: string;
};

export async function pauseSchedule({
  namespace,
  scheduleId,
  pause,
}: PauseScheduleOptions): Promise<null> {
  const options = {
    pause,
    overlayPolicy: 'allowall',
    startTime: '2022-05-09T11:00:00Z',
    endTime: '2022-05-09T11:15:00Z',
  };

  return await requestFromAPI<null>(
    routeForApi('schedule', {
      namespace,
      scheduleId: scheduleId,
    }),
    {
      // options: { method: 'POST', body: JSON.stringify({ ...options }) },
      options: {
        method: 'POST',
        body: JSON.stringify({
          pause,
        }),
      },
      shouldRetry: false,
      onError: (error) => {},
    },
  );
}

type UnpauseScheduleOptions = {
  namespace: string;
  scheduleId: string;
  unpause: string;
};

export async function unpauseSchedule({
  namespace,
  scheduleId,
  unpause,
}: UnpauseScheduleOptions): Promise<null> {
  return await requestFromAPI<null>(
    routeForApi('schedule', {
      namespace,
      scheduleId: scheduleId,
    }),
    {
      options: { method: 'POST', body: JSON.stringify({ unpause }) },
      shouldRetry: false,
    },
  );
}
