import type { EventGroup } from '$lib/models/event-groups/event-groups';
import {
  materializeTimelineGroup,
  type TimelineGroup,
  type TimelineRun,
} from '$lib/services/chain-workflow-session';
import type { LazyGroup } from '$lib/services/grouped-event-buffer';

import type { TimelineWorkflowNode } from './recursive-timeline-model';

/**
 * Waits shorter than this are normal dispatch latency, not worth a row; a
 * longer one means no worker picked the task up.
 */
export const WORKER_WAIT_THRESHOLD_MS = 1_000;

const WAIT_KEY_SUFFIX = ':waiting';

export const isWorkerWaitKey = (timelineKey: string): boolean =>
  timelineKey.endsWith(WAIT_KEY_SUFFIX);

/** The activity a waiting row belongs to, for selecting and details. */
export const workerWaitSourceKey = (timelineKey: string): string =>
  isWorkerWaitKey(timelineKey)
    ? timelineKey.slice(0, -WAIT_KEY_SUFFIX.length)
    : timelineKey;

const timeMs = (value: unknown): number | undefined => {
  if (typeof value !== 'string' && !(value instanceof Date)) return undefined;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
};

const scheduledTimeMs = (group: EventGroup | LazyGroup): number | undefined =>
  ('startTimeMs' in group ? group.startTimeMs : undefined) ??
  timeMs(group.initialEvent?.eventTime);

const startedTimeMs = (group: EventGroup | LazyGroup): number | undefined => {
  if ('activityStartedTimeMs' in group && group.activityStartedTimeMs) {
    return group.activityStartedTimeMs;
  }
  if ('eventList' in group) {
    const started = group.eventList.find(
      (event) => event.eventType === 'ActivityTaskStarted',
    );
    if (started) return timeMs(started.eventTime);
  }
  return timeMs(group.pendingActivity?.lastStartedTime);
};

const attemptOf = (group: EventGroup | LazyGroup): number =>
  group.pendingActivity?.attempt ??
  ('activityAttempt' in group ? group.activityAttempt : undefined) ??
  1;

export type WorkerWait = { startTimeMs: number; endTimeMs?: number };

/**
 * How long an activity sat scheduled before a worker started it. Only a
 * first attempt counts: after a retry the gap also holds earlier attempts
 * and their backoff, which isn't waiting for a worker. An open wait (still
 * unstarted) has no end.
 */
export const getWorkerWait = (
  group: EventGroup | LazyGroup,
  nowMs: number,
): WorkerWait | undefined => {
  if (group.category !== 'activity' || attemptOf(group) > 1) return undefined;
  const startTimeMs = scheduledTimeMs(group);
  if (startTimeMs === undefined) return undefined;
  const endTimeMs = startedTimeMs(group);
  if (endTimeMs === undefined) {
    if (!group.isPending) return undefined;
    return nowMs - startTimeMs >= WORKER_WAIT_THRESHOLD_MS
      ? { startTimeMs }
      : undefined;
  }
  return endTimeMs - startTimeMs >= WORKER_WAIT_THRESHOLD_MS
    ? { startTimeMs, endTimeMs }
    : undefined;
};

const waitGroup = (
  source: EventGroup | LazyGroup,
  wait: WorkerWait,
): LazyGroup => ({
  id: `${source.id}${WAIT_KEY_SUFFIX}`,
  eventCount: wait.endTimeMs === undefined ? 1 : 2,
  startTimeMs: wait.startTimeMs,
  lastTimeMs: wait.endTimeMs ?? wait.startTimeMs,
  initialEvent: source.initialEvent,
  lastEvent: source.initialEvent,
  category: 'other',
  classification: 'Scheduled',
  finalClassification: 'Scheduled',
  isPending: wait.endTimeMs === undefined,
  pendingActivity: undefined,
  pendingNexusOperation: undefined,
  eventPoints: [
    {
      eventId: Number(source.initialEvent.id),
      timeMs: wait.startTimeMs,
      classification: 'Scheduled',
    },
    ...(wait.endTimeMs === undefined
      ? []
      : [
          {
            eventId: Number(source.initialEvent.id),
            timeMs: wait.endTimeMs,
            classification: 'Scheduled' as const,
          },
        ]),
  ],
  timelineDisplayName: 'Waiting for a worker',
  timelineCategory: 'other',
});

/**
 * The activity's own bar starts once a worker picks it up, since its waiting
 * row now shows the time before. An open wait leaves the bar as it is.
 */
const withoutWait = (entry: TimelineGroup, wait: WorkerWait): TimelineGroup => {
  const { group } = entry;
  if (wait.endTimeMs === undefined || !('eventPoints' in group)) return entry;
  const [scheduled, ...rest] = group.eventPoints ?? [];
  if (!scheduled || rest.length === 0) return entry;
  return {
    ...entry,
    group: {
      ...group,
      eventPoints: [{ ...scheduled, timeMs: wait.endTimeMs }, ...rest],
    },
  };
};

/** A run's groups with a waiting row just before each activity that waited. */
export const withWorkerWaitGroups = (
  groups: readonly TimelineGroup[],
  nowMs: number,
): TimelineGroup[] | undefined => {
  let added = false;
  const result: TimelineGroup[] = [];
  for (const entry of groups) {
    const wait = getWorkerWait(entry.group, nowMs);
    if (wait) {
      added = true;
      result.push({
        ...entry,
        timelineKey: `${entry.timelineKey}${WAIT_KEY_SUFFIX}`,
        group: waitGroup(entry.group, wait),
        // Details for a waiting row are the activity's own.
        materialize: () => materializeTimelineGroup(entry),
      });
      result.push(withoutWait(entry, wait));
      continue;
    }
    result.push(entry);
  }
  // Rows are found by their place in the run, so places are renumbered.
  return added
    ? result.map((entry, ordinal) =>
        entry.ordinal === undefined ? entry : { ...entry, ordinal },
      )
    : undefined;
};

/**
 * The workflow tree with waiting rows added to every run, children included.
 * Untouched nodes and runs are returned as they are.
 */
export const withWorkerWaitRows = (
  node: TimelineWorkflowNode,
  nowMs: number,
): TimelineWorkflowNode => {
  let changed = false;
  const runs = node.runs.map((run): TimelineRun => {
    const groups = withWorkerWaitGroups(run.groups, nowMs);
    if (!groups) return run;
    changed = true;
    return { ...run, groups };
  });
  const children = new Map(node.childrenByGroupKey);
  for (const [key, edge] of node.childrenByGroupKey) {
    if (edge.load.state !== 'loaded') continue;
    const child = withWorkerWaitRows(edge.load.node, nowMs);
    if (child === edge.load.node) continue;
    changed = true;
    children.set(key, { ...edge, load: { ...edge.load, node: child } });
  }
  return changed ? { ...node, runs, childrenByGroupKey: children } : node;
};
