import type { EventTypeCategory } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

import {
  groupAttempt,
  groupTiming,
  timelineGroupName,
  type TimelineGutterTiming,
} from './gutter/timeline-gutter-cells';
import type { TimelineWorkflowNode } from './recursive-timeline-model';

export type TimelineChildOutcome =
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'running'
  | 'other';

export type TimelineChildSummaryItem = {
  timelineKey: string;
  label: string;
  category?: EventTypeCategory;
  outcome: TimelineChildOutcome;
  timing?: TimelineGutterTiming;
  attempt?: number;
  /** Set by the caller: whether the item can be selected right now. */
  selectable?: boolean;
};

export type TimelineChildSummaryRun = {
  runId: string;
  /** "Run 2 of 3"; unset when the workflow has a single run. */
  label?: string;
  items: TimelineChildSummaryItem[];
};

export type TimelineChildSummary = {
  namespace: string;
  workflowId: string;
  /** The latest run, which is the one its own page opens on. */
  runId: string;
  workflowType: string;
  status: WorkflowStatus;
  timing?: TimelineGutterTiming;
  runs: TimelineChildSummaryRun[];
  activities: {
    total: number;
    completed: number;
    failed: number;
    retried: number;
  };
  /** Workflows started directly inside it, across its runs. */
  childWorkflows: number;
};

const isActivity = (category: string | undefined) =>
  category === 'activity' || category === 'local-activity';

const outcomeOf = (
  group: { isPending: boolean; finalClassification?: string | null },
  runActive: boolean,
): TimelineChildOutcome => {
  if (group.isPending) return runActive ? 'running' : 'other';
  switch (group.finalClassification) {
    case 'Completed':
    case 'Fired':
      return 'completed';
    case 'Failed':
    case 'TimedOut':
    case 'Terminated':
      return 'failed';
    case 'Canceled':
      return 'canceled';
    default:
      return 'other';
  }
};

/**
 * What a child workflow did, for the panel that opens when it's selected: its
 * outcome at a glance, then what ran directly inside it, run by run. Nested
 * workflows count as single items; their insides belong to their own rows.
 */
export const summarizeChildWorkflow = (
  node: TimelineWorkflowNode,
): TimelineChildSummary => {
  const activities = { total: 0, completed: 0, failed: 0, retried: 0 };
  let childWorkflows = 0;
  const multiRun = node.runs.length > 1;
  const runs = node.runs.map((run, index) => ({
    runId: run.runId,
    label: multiRun ? `Run ${index + 1} of ${node.runs.length}` : undefined,
    items: run.groups.map((entry): TimelineChildSummaryItem => {
      const outcome = outcomeOf(entry.group, run.active);
      const attempt = groupAttempt(entry.group);
      if (isActivity(entry.group.category)) {
        activities.total += 1;
        if (outcome === 'completed') activities.completed += 1;
        if (outcome === 'failed') activities.failed += 1;
        if (attempt) activities.retried += 1;
      }
      if (entry.group.category === 'child-workflow') childWorkflows += 1;
      return {
        timelineKey: entry.timelineKey,
        label: timelineGroupName(entry.group, node.namespace),
        category: entry.group.category as EventTypeCategory | undefined,
        outcome,
        timing: groupTiming({
          group: entry.group,
          active: run.active,
          runEndTimeMs: run.endTimeMs,
        }),
        attempt,
      };
    }),
  }));

  const startTimeMs = Math.min(...node.runs.map((run) => run.startTimeMs));
  const live = node.runs.some((run) => run.active);
  return {
    namespace: node.namespace,
    workflowId: node.workflowId,
    runId: node.runs.at(-1)?.runId ?? node.firstRunId,
    workflowType: node.workflow.name ?? '',
    status: node.workflow.status,
    timing: node.runs.length
      ? {
          startTimeMs,
          endTimeMs: live
            ? undefined
            : Math.max(...node.runs.map((run) => run.endTimeMs)),
        }
      : undefined,
    runs,
    activities,
    childWorkflows,
  };
};
