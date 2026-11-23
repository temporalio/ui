import { getRecentScheduleActions } from '$lib/components/schedule/utilities/recent-actions';
import { fetchWorkflowsForQuery } from '$lib/services/workflow-service';
import type { ScheduleActionResult } from '$lib/types';
import type { DescribeFullSchedule } from '$lib/types/schedule';
import type { WorkflowExecution, WorkflowStatus } from '$lib/types/workflows';
import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
import { getEpochMilliseconds } from '$lib/utilities/format-time';
import { toWorkflowStatusReadable } from '$lib/utilities/screaming-enums';
import { isWorkflowTaskFailure } from '$lib/utilities/workflow-task-failures';

/**
 * A row in the schedule's recent runs list. `status` and `runId` start out as
 * the ones recorded on the action; once visibility answers they are replaced
 * by the matching execution's, which for a continue-as-new chain is the latest
 * run rather than the one the schedule started.
 */
export type RecentWorkflowRun = {
  workflowId: string;
  runId: string;
  actualTime: ScheduleActionResult['actualTime'];
  status: WorkflowStatus;
};

export type RecentWorkflowRunEnriched = RecentWorkflowRun & {
  delayed: boolean;
  taskFailure: boolean;
  inVisibility: boolean;
};

const RECENT_RUN_COUNT = 5;

export const toRecentWorkflowRuns = (
  schedule: DescribeFullSchedule,
  limit = RECENT_RUN_COUNT,
): RecentWorkflowRun[] =>
  getRecentScheduleActions(schedule?.info?.recentActions ?? [], limit).map(
    (action) => ({
      workflowId: action.startWorkflowResult?.workflowId ?? '',
      runId: action.startWorkflowResult?.runId ?? '',
      actualTime: action.actualTime,
      status: toWorkflowStatusReadable(action.startWorkflowStatus ?? null),
    }),
  );

export const withLatestWorkflowStatuses = (
  runs: RecentWorkflowRun[],
  workflows: WorkflowExecution[],
): RecentWorkflowRunEnriched[] => {
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
      return {
        ...run,
        delayed: false,
        taskFailure: false,
        inVisibility: false,
      };
    }
    return {
      actualTime: run.actualTime,
      workflowId: latestWorkflow.id || run.workflowId,
      status: latestWorkflow.status || run.status,
      runId: latestWorkflow.runId || run.runId,
      delayed: isWorkflowDelayed(latestWorkflow),
      taskFailure: isWorkflowTaskFailure(latestWorkflow),
      inVisibility: true,
    };
  });
};

type RecentRunStatusParams = {
  namespace: string;
  scheduleId: string;
  runs: RecentWorkflowRun[];
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
export const fetchRecentWorkflowRunStatuses = async (
  { namespace, scheduleId, runs }: RecentRunStatusParams,
  request = fetch,
): Promise<RecentWorkflowRunEnriched[]> => {
  const workflowIds = [
    ...new Set(runs.map((run) => run.workflowId).filter(Boolean)),
  ];
  if (!workflowIds.length) {
    return withLatestWorkflowStatuses(runs, []);
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
