import { translate } from '$lib/i18n/translate';
import type { ListScheduleResponse, ScheduleListEntry } from '$lib/types';
import type {
  DescribeFullSchedule,
  OverlapPolicy,
  RecentScheduleRun,
  ScheduleRequestBody,
} from '$lib/types/schedule';
import type { WorkflowExecution } from '$lib/types/workflows';
import { getEpochMilliseconds } from '$lib/utilities/format-time';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toWorkflowStatusReadable } from '$lib/utilities/screaming-enums';

import { fetchWorkflowsForQuery } from './workflow-service';

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
  query: string | null,
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
    }).then((response) => {
      const { schedules, nextPageToken } = response ?? {};
      return {
        items: schedules ?? [],
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
    })) ?? { schedules: [] as ScheduleListEntry[], nextPageToken: '' };

  return {
    schedules: schedules ?? [],
    nextPageToken: String(nextPageToken),
    error,
  };
};

export async function fetchSchedule(
  parameters: ScheduleParameters,
  request = fetch,
): Promise<DescribeFullSchedule> {
  const route = routeForApi('schedule', parameters);
  const response = await requestFromAPI<
    Omit<DescribeFullSchedule, 'schedule_id'>
  >(route, { request });
  // schedule_id is not actually populated by all routes, even though
  // DescribeFullSchedule says it should, since we know it we can attach it here.
  return { ...response, schedule_id: parameters.scheduleId };
}

const RECENT_RUN_COUNT = 5;
const UPCOMING_RUN_COUNT = 5;

export const toRecentScheduleRuns = (
  schedule: DescribeFullSchedule,
  limit = RECENT_RUN_COUNT,
): RecentScheduleRun[] =>
  (schedule?.info?.recentActions ?? [])
    .filter(Boolean)
    .sort(
      (a, b) =>
        getEpochMilliseconds(b.actualTime) - getEpochMilliseconds(a.actualTime),
    )
    .slice(0, limit)
    .map((action) => ({
      workflowId: action.startWorkflowResult?.workflowId ?? '',
      runId: action.startWorkflowResult?.runId ?? '',
      actualTime: action.actualTime,
      status: toWorkflowStatusReadable(action.startWorkflowStatus ?? null),
    }));

export const toUpcomingScheduleRuns = (
  schedule: DescribeFullSchedule,
  limit = UPCOMING_RUN_COUNT,
) =>
  (schedule?.info?.futureActionTimes ?? [])
    .filter(Boolean)
    .sort((a, b) => getEpochMilliseconds(a) - getEpochMilliseconds(b))
    .slice(0, limit);

export const withLatestWorkflowStatuses = (
  runs: RecentScheduleRun[],
  workflows: WorkflowExecution[],
): RecentScheduleRun[] => {
  const latest = new Map<string, WorkflowExecution>();
  for (const workflow of workflows) {
    const current = latest.get(workflow.id);
    const isNewer =
      !current ||
      getEpochMilliseconds(workflow.startTime) >=
        getEpochMilliseconds(current.startTime);
    if (isNewer) {
      latest.set(workflow.id, workflow);
    }
  }

  return runs.map((run) => {
    const latestWorkflow = latest.get(run.workflowId);
    if (!latestWorkflow) {
      return run;
    }
    return {
      actualTime: run.actualTime,
      workflowId: latestWorkflow.id || run.workflowId,
      status: latestWorkflow.status || run.status,
      runId: latestWorkflow.runId || run.runId,
    };
  });
};

type RecentRunStatusParams = {
  namespace: string;
  scheduleId: string;
  runs: RecentScheduleRun[];
};

/**
 * `startWorkflowStatus` on a recent action is only refreshed while the
 * scheduler is watching the run, so it goes stale for long stretches and never
 * reports paused. Resolve the live status from visibility instead.
 *
 * Visibility cannot be sorted, so the query has to be narrow enough that a page
 * can never truncate it: scoping to the runs on screen bounds it to those
 * workflow ids, and excluding ContinuedAsNew discards every link of a
 * continue-as-new chain but the last, leaving at most one execution per id.
 */
export const fetchRecentScheduleRunStatuses = async (
  { namespace, scheduleId, runs }: RecentRunStatusParams,
  request = fetch,
): Promise<RecentScheduleRun[]> => {
  const workflowIds = [
    ...new Set(runs.map((run) => run.workflowId).filter(Boolean)),
  ];
  if (!workflowIds.length) {
    return runs;
  }

  // Backslashes first: the query tokenizer treats them as escape characters, so
  // an unescaped one swallows the character after it.
  const ids = workflowIds
    .map(
      (workflowId) =>
        `"${workflowId.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
    )
    .join(', ');
  const query =
    `TemporalScheduledById="${scheduleId}"` +
    ` AND WorkflowId in (${ids})` +
    ' AND ExecutionStatus != "ContinuedAsNew"';
  const workflows = await fetchWorkflowsForQuery({ namespace, query }, request);

  return withLatestWorkflowStatuses(runs, workflows);
};

export async function deleteSchedule(
  {
    namespace,
    scheduleId,
    identity,
  }: ScheduleParameters & {
    identity?: string;
  },
  request = fetch,
): Promise<void> {
  const route = routeForApi('schedule', { namespace, scheduleId });
  return requestFromAPI(route, {
    request,
    options: { method: 'DELETE' },
    params: identity ? { identity } : {},
  });
}

type CreateScheduleOptions = {
  namespace: string;
  scheduleId: string;
  body: ScheduleRequestBody;
  identity?: string;
};

export async function createSchedule({
  namespace,
  scheduleId,
  body,
  identity,
}: CreateScheduleOptions): Promise<{ error: string; conflictToken: string }> {
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `Error creating schedule: ${err.status}: ${err.statusText}`);

  const route = routeForApi('schedule', {
    namespace,
    scheduleId,
  });
  const { conflictToken } = (await requestFromAPI<{ conflictToken: string }>(
    route,
    {
      options: {
        method: 'POST',
        body: stringifyWithBigInt({
          request_id: crypto.randomUUID(),
          ...body,
          ...(identity && { identity }),
        }),
      },
      onError,
    },
  )) ?? { conflictToken: '' };

  return { conflictToken, error };
}

type EditScheduleOptions = {
  namespace: string;
  scheduleId: string;
  request_id: string;
  body: ScheduleRequestBody;
};

export async function editSchedule({
  namespace,
  scheduleId,
  body,
  identity,
}: Partial<EditScheduleOptions> & { identity?: string }): Promise<{
  error: string;
}> {
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `Error editing schedule: ${err.status}: ${err.statusText}`);

  const route = routeForApi('schedule.edit', {
    namespace: namespace ?? '',
    scheduleId: scheduleId ?? '',
  });
  await requestFromAPI<null>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        request_id: crypto.randomUUID(),
        ...body,
        ...(identity && { identity }),
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
  identity?: string;
};

export async function pauseSchedule({
  namespace,
  scheduleId,
  reason,
  identity,
}: PauseScheduleOptions): Promise<null> {
  const options = {
    patch: {
      pause: reason,
    },
  };

  const route = routeForApi('schedule.patch', {
    namespace,
    scheduleId: scheduleId,
  });
  return (
    (await requestFromAPI<null>(route, {
      options: {
        method: 'POST',
        body: stringifyWithBigInt({
          ...options,
          request_id: crypto.randomUUID(),
          ...(identity && { identity }),
        }),
      },
      onError: (error) => console.error(error),
    })) ?? null
  );
}

type UnpauseScheduleOptions = {
  namespace: string;
  scheduleId: string;
  reason: string;
  identity?: string;
};

export async function unpauseSchedule({
  namespace,
  scheduleId,
  reason,
  identity,
}: UnpauseScheduleOptions): Promise<null> {
  const options = {
    patch: {
      unpause: reason,
    },
  };

  const route = routeForApi('schedule.patch', {
    namespace,
    scheduleId: scheduleId,
  });
  return (
    (await requestFromAPI<null>(route, {
      options: {
        method: 'POST',
        body: stringifyWithBigInt({
          ...options,
          request_id: crypto.randomUUID(),
          ...(identity && { identity }),
        }),
      },
    })) ?? null
  );
}

type TriggerImmediatelyOptions = {
  namespace: string;
  scheduleId: string;
  overlapPolicy: OverlapPolicy;
  identity?: string;
};

export async function triggerImmediately({
  namespace,
  scheduleId,
  overlapPolicy,
  identity,
}: TriggerImmediatelyOptions): Promise<null> {
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
  return (
    (await requestFromAPI<null>(route, {
      options: {
        method: 'POST',
        body: stringifyWithBigInt({
          ...options,
          request_id: crypto.randomUUID(),
          ...(identity && { identity }),
        }),
      },
    })) ?? null
  );
}

type BackfillOptions = TriggerImmediatelyOptions & {
  startTime: string;
  endTime: string;
};

export async function backfillRequest({
  namespace,
  scheduleId,
  overlapPolicy,
  identity,
  startTime,
  endTime,
}: BackfillOptions): Promise<null> {
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
  return (
    (await requestFromAPI<null>(route, {
      options: {
        method: 'POST',
        body: stringifyWithBigInt({
          ...options,
          request_id: crypto.randomUUID(),
          ...(identity && { identity }),
        }),
      },
    })) ?? null
  );
}
