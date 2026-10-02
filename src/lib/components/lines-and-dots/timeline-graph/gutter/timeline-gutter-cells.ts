import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { getEventGroupDisplayName } from '$lib/models/event-groups/get-group-name';
import type { LazyGroup } from '$lib/services/grouped-event-buffer';
import type { EventTypeCategory } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';
import { validTimeToDate } from '$lib/utilities/format-time';

import type { TimelineWorkflowNode } from '../recursive-timeline-model';
import { getChildWorkflowReference } from '../timeline-child-reference';
import type { TimelineLayoutRow } from '../timeline-containment-layout';

/**
 * What the left gutter draws for one timeline row. The plot area keeps only
 * time, so everything that identifies a row — its name, how deep it sits, and
 * whether its subtree can be folded away — is expressed here instead.
 */
export type TimelineGutterCell = {
  key: string;
  kind: 'workflow' | 'run' | 'event' | 'child-state';
  depth: number;
  /** The row's one line of text. */
  label: string;
  /** What the row's hover card shows: the half of its identity left out. */
  reveal?: TimelineGutterReveal;
  /** Selects the row's event group for the details panel. */
  detailsKey?: string;
  /** An activity or child workflow that ran to completion, marked done. */
  completed?: boolean;
  /** When the row's work ran, for its duration. */
  timing?: TimelineGutterTiming;
  /** An activity's attempt number, set only once it has retried. */
  attempt?: number;
  status?: WorkflowStatus;
  /** Drives the row's icon and its dim kind prefix. */
  category?: EventTypeCategory;
  toggleEdgeKey?: string;
  /** Set instead of toggleEdgeKey on a run row, which folds by run not edge. */
  toggleRunKey?: string;
  expanded?: boolean;
  /** Set on a run row only when its workflow owns more than one run. */
  runOrdinal?: { index: number; total: number };
};

const isActivityCategory = (category: EventTypeCategory | undefined) =>
  category === 'activity' || category === 'local-activity';

/** An open end means the work is still running, so its duration counts up. */
export type TimelineGutterTiming = {
  startTimeMs: number;
  endTimeMs?: number;
};

export type TimelineGutterReveal = {
  kind: 'run-id' | 'workflow-id';
  value: string;
};

export type GutterWorkflowSummary = {
  namespace: string;
  workflowId: string;
  workflowType: string;
  status: WorkflowStatus;
  runCount: number;
  incomingEdgeKey?: string;
  expanded: boolean;
  /** The workflow's whole span, from its first run's start to its last's end. */
  timing?: TimelineGutterTiming;
  runTimings?: ReadonlyMap<string, TimelineGutterTiming>;
};

type TimedRun = { startTimeMs: number; endTimeMs: number; active: boolean };

const runTiming = (run: TimedRun): TimelineGutterTiming => ({
  startTimeMs: run.startTimeMs,
  endTimeMs: run.active ? undefined : run.endTimeMs,
});

const workflowTiming = (
  runs: readonly TimedRun[],
): TimelineGutterTiming | undefined => {
  if (!runs.length) return undefined;
  const startTimeMs = Math.min(...runs.map((run) => run.startTimeMs));
  const endTimeMs = runs.some((run) => run.active)
    ? undefined
    : Math.max(...runs.map((run) => run.endTimeMs));
  return { startTimeMs, endTimeMs };
};

const eventTimeMs = (event: { eventTime?: unknown } | undefined) =>
  event?.eventTime
    ? validTimeToDate(event.eventTime as never).getTime()
    : undefined;

/**
 * The span an event group's work took. A group of one event happened at an
 * instant — a signal, a marker — so it has none. A group still waiting runs
 * to now while its run is live, and to the run's end once it isn't.
 */
export const groupTiming = (entry: {
  group: EventGroup | LazyGroup;
  active: boolean;
  runEndTimeMs: number;
}): TimelineGutterTiming | undefined => {
  const { group } = entry;
  if (group.eventCount <= 1 && !group.isPending) return undefined;
  const startTimeMs =
    ('startTimeMs' in group ? group.startTimeMs : undefined) ??
    eventTimeMs(group.initialEvent);
  if (startTimeMs === undefined) return undefined;
  if (group.isPending) {
    return {
      startTimeMs,
      endTimeMs: entry.active ? undefined : entry.runEndTimeMs,
    };
  }
  const endTimeMs =
    ('lastTimeMs' in group ? group.lastTimeMs : undefined) ??
    eventTimeMs(group.lastEvent);
  return endTimeMs === undefined ? undefined : { startTimeMs, endTimeMs };
};

/** The attempt an activity is on, or ended on, once it has retried. */
export const groupAttempt = (
  group: EventGroup | LazyGroup,
): number | undefined => {
  if (!isActivityCategory(group.category)) return undefined;
  const attempt =
    group.pendingActivity?.attempt ??
    ('activityAttempt' in group ? group.activityAttempt : undefined);
  return attempt !== undefined && attempt > 1 ? attempt : undefined;
};

export const gutterWorkflowSummaries = (
  nodes: TimelineWorkflowNode[],
  incomingEdgeByWorkflowKey: Map<
    string,
    { key: string; expansion: 'expanded' | 'collapsed' }
  >,
): Map<string, GutterWorkflowSummary> => {
  const summaries = new Map<string, GutterWorkflowSummary>();

  for (const node of nodes) {
    const edge = incomingEdgeByWorkflowKey.get(node.key);
    summaries.set(node.key, {
      namespace: node.namespace,
      workflowId: node.workflowId,
      workflowType: node.workflow.name ?? '',
      status: node.workflow.status,
      runCount: node.runs.length,
      incomingEdgeKey: edge?.key,
      expanded: edge ? edge.expansion === 'expanded' : true,
      timing: workflowTiming(node.runs),
      runTimings: new Map(node.runs.map((run) => [run.runId, runTiming(run)])),
    });
  }

  return summaries;
};

/**
 * The child execution a group points at. Uses the shared resolver because a
 * group carries the reference either as a lazy field or in its started event,
 * depending on whether it has been materialized.
 */
const groupChildWorkflowId = (
  group: EventGroup | LazyGroup,
  namespace: string,
): string | undefined =>
  getChildWorkflowReference(group, namespace)?.workflowId;

const groupLabel = (group: EventGroup | LazyGroup): string => {
  const lazy = group as LazyGroup;
  if (lazy.timelineDisplayName) return lazy.timelineDisplayName;
  const eventGroup = group as EventGroup;
  return (
    eventGroup.displayName ||
    eventGroup.name ||
    eventGroup.label ||
    // Groups from a run still in progress carry no precomputed name, so it
    // comes from the event that started them, as the plot's rows do.
    getEventGroupDisplayName(group.initialEvent as never) ||
    // The event that starts a child names the child, not its category:
    // "child-workflow" repeated down a tree says nothing.
    lazy.childWorkflow?.workflowId ||
    group.category ||
    'Event'
  );
};

/**
 * What a group is called wherever the timeline names it: a child workflow by
 * its id, anything else by its own name.
 */
export const timelineGroupName = (
  group: EventGroup | LazyGroup,
  namespace: string,
): string => groupChildWorkflowId(group, namespace) ?? groupLabel(group);

/**
 * Maps one layout row to its gutter cell. Rows that exist purely to reserve
 * space for the in-canvas frames — spacing, and the run header of a
 * single-run workflow — return null so the gutter stays quiet where the
 * canvas has nothing to name.
 */
export const toGutterCell = (
  row: TimelineLayoutRow,
  {
    workflows,
    runOrdinals,
    collapsedRunKeys,
    ancestorRunLevels,
  }: {
    workflows: Map<string, GutterWorkflowSummary>;
    runOrdinals?: Map<string, { index: number; total: number }>;
    collapsedRunKeys?: ReadonlySet<string>;
    /** From gutterAncestorRunLevels; without it, nesting is taken as-is. */
    ancestorRunLevels?: ReadonlyMap<string, number>;
  },
): TimelineGutterCell | null => {
  // A row's depth is its workflow's nesting plus every run row an ancestor
  // inserted above it, plus its own place inside its workflow.
  const lift = ancestorRunLevels?.get(row.workflowKey) ?? 0;
  const contentOffset = (workflowKey: string) =>
    (workflows.get(workflowKey)?.runCount ?? 1) > 1 ? 2 : 1;

  switch (row.kind) {
    case 'workflow-header': {
      const summary = workflows.get(row.workflowKey);
      if (!summary) return null;
      return {
        key: row.key,
        kind: 'workflow',
        depth: row.depth + lift,
        // The id is what tells repeated workflows apart, so it carries the
        // row, and its hover card offers the same id to copy.
        label: summary.workflowId,
        reveal: { kind: 'workflow-id', value: summary.workflowId },
        timing: summary.timing,
        status: summary.status,
        category: 'workflow',
        toggleEdgeKey: summary.incomingEdgeKey,
        expanded: summary.expanded,
      };
    }

    case 'frame-header': {
      const summary = workflows.get(row.workflowKey);
      const ordinal = runOrdinals?.get(row.runKey);
      if (!summary || summary.runCount <= 1) return null;
      return {
        key: row.key,
        kind: 'run',
        depth: row.depth + lift + 1,
        // The run's place in the chain carries the row; its id is only
        // wanted when someone goes looking, so it waits in the hover card.
        label: ordinal ? `Run ${ordinal.index} of ${ordinal.total}` : 'Run',
        reveal: { kind: 'run-id', value: row.runId },
        timing: summary.runTimings?.get(row.runId),
        runOrdinal: ordinal,
        toggleRunKey: row.runKey,
        expanded: !collapsedRunKeys?.has(row.runKey),
      };
    }

    case 'group': {
      const summary = workflows.get(row.workflowKey);
      const childWorkflowId = groupChildWorkflowId(
        row.entry.group,
        summary?.namespace ?? '',
      );
      return {
        key: row.key,
        kind: 'event',
        depth: row.depth + lift + contentOffset(row.workflowKey),
        // A row that starts a child workflow is named like the workflow
        // itself: by its id, which its hover card offers to copy.
        label: childWorkflowId ?? groupLabel(row.entry.group),
        reveal: childWorkflowId
          ? { kind: 'workflow-id', value: childWorkflowId }
          : undefined,
        status: row.entry.resolvedStatus,
        category: row.entry.group.category,
        detailsKey: row.entry.timelineKey,
        completed:
          (isActivityCategory(row.entry.group.category) ||
            row.entry.group.category === 'child-workflow') &&
          row.entry.group.finalClassification === 'Completed',
        timing: groupTiming(row.entry),
        attempt: groupAttempt(row.entry.group),
        toggleEdgeKey: row.childEdge?.key,
        expanded: row.childEdge
          ? row.childEdge.expansion === 'expanded'
          : undefined,
      };
    }

    case 'child-state':
      return {
        key: row.key,
        kind: 'child-state',
        // Stands in for the child's content, so it hangs one level under the
        // row that started the child rather than beside it.
        depth: row.depth + lift + contentOffset(row.workflowKey),
        label: row.edge.reference.workflowId,
        category: 'child-workflow',
        toggleEdgeKey: row.edge.key,
        expanded: row.edge.expansion === 'expanded',
      };

    case 'empty-run':
      return {
        key: row.key,
        kind: 'run',
        depth: row.depth + lift + contentOffset(row.workflowKey),
        label: 'No events in range',
      };

    default:
      return null;
  }
};

/**
 * How many run levels each workflow's ancestors insert into the tree. A
 * workflow that ran more than once puts a "Run N of M" row between itself and
 * its events, so everything it started sits one level deeper than its plain
 * nesting depth — and that carries down to every workflow nested below it.
 */
export const gutterAncestorRunLevels = (
  root: TimelineWorkflowNode,
): Map<string, number> => {
  const levels = new Map<string, number>();
  const visit = (node: TimelineWorkflowNode, inherited: number): void => {
    levels.set(node.key, inherited);
    const passedDown = inherited + (node.runs.length > 1 ? 1 : 0);
    for (const edge of node.childrenByGroupKey.values()) {
      if (edge.load.state === 'loaded' && !edge.load.truncation) {
        visit(edge.load.node, passedDown);
      }
    }
  };
  visit(root, 0);
  return levels;
};

/** Run index within each workflow, so a run row can read "Run 2 of 3". */
export const gutterRunOrdinals = (
  nodes: TimelineWorkflowNode[],
  runKeyFor: (workflowKey: string, runId: string) => string,
): Map<string, { index: number; total: number }> => {
  const ordinals = new Map<string, { index: number; total: number }>();

  for (const node of nodes) {
    const ordered = [...node.runs].sort(
      (a, b) => a.startTimeMs - b.startTimeMs,
    );
    ordered.forEach((run, index) => {
      ordinals.set(runKeyFor(node.key, run.runId), {
        index: index + 1,
        total: ordered.length,
      });
    });
  }

  return ordinals;
};

export type GutterTreeLines = {
  /**
   * Rail positions to keep drawing through this row. Rail `k` joins siblings
   * at depth `k + 1`, so it continues while that generation has more rows.
   */
  guides: number[];
  /** Level the row's elbow hangs from; null for a root row. */
  elbowLevel: number | null;
  /** Last child at its level, so its own vertical stops at the elbow. */
  lastChild: boolean;
  /** Direct children below this row, for the row's count badge. */
  childCount: number;
};

/**
 * Tree connectors for a flat, depth-annotated row list — the `├`/`└` shapes a
 * file tree draws. Derived from the row sequence alone, so it needs no parent
 * pointers, and each row carries its own segments rather than relying on a
 * continuous line drawn behind them.
 */
export const gutterTreeLines = (depths: number[]): GutterTreeLines[] => {
  const maxDepth = depths.reduce((max, depth) => Math.max(max, depth), 0);
  const childCounts = depths.map((depth, index) => {
    let count = 0;
    for (let next = index + 1; next < depths.length; next += 1) {
      if (depths[next] <= depth) break;
      if (depths[next] === depth + 1) count += 1;
    }
    return count;
  });
  const openAtLevel = new Array<boolean>(maxDepth + 2).fill(false);
  const lines = new Array<GutterTreeLines>(depths.length);

  for (let index = depths.length - 1; index >= 0; index -= 1) {
    const depth = depths[index];

    // Anything deeper than this row is closed by it.
    for (let level = depth + 1; level < openAtLevel.length; level += 1) {
      openAtLevel[level] = false;
    }

    const guides: number[] = [];
    for (let level = 1; level < depth; level += 1) {
      if (openAtLevel[level]) guides.push(level - 1);
    }

    lines[index] = {
      guides,
      elbowLevel: depth > 0 ? depth - 1 : null,
      lastChild: !openAtLevel[depth],
      childCount: childCounts[index],
    };

    openAtLevel[depth] = true;
  }

  return lines;
};

/**
 * Row range covered by a row and everything nested under it: from the row
 * itself up to (but excluding) the next row at the same depth or shallower.
 * Lets a hover read as "this workflow and its work" rather than one line.
 */
export const gutterSubtreeRange = (
  depths: number[],
  index: number,
): { start: number; end: number } | null => {
  if (index < 0 || index >= depths.length) return null;

  const depth = depths[index];
  let end = index + 1;
  while (end < depths.length && depths[end] > depth) end += 1;

  return { start: index, end };
};
