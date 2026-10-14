import type {
  EventTypeCategory,
  HistoryEvent,
  PendingActivityInfo,
} from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

import { updateOtherChainStep } from './run-chain-primitives';

export type ChainRun = {
  runId: string;
  previousRunId?: string;
  nextRunId?: string;
  startTime: number;
  closeTime?: number;
  status: string;
  eventCount: string;
  inputBytes?: number;
  firstRunId?: string;
};

export type ChainStep = {
  id: string;
  name: string;
  kind: Exclude<EventTypeCategory, 'workflow'>;
  status: string;
  startTime: number;
  closeTime?: number;
  lane: number;
  attempts?: number;
  interruptedBy?: string;
  activityId?: string;
  maximumAttempts?: number;
  lastFailure?: string;
  nextAttemptTime?: number;
  lastAttemptStartedTime?: number;
};

export type LiveRunState = {
  runId: string;
  fetchedAt: number;
  pendingActivities: PendingActivityInfo[];
};

export function eventTime(value: unknown): number {
  if (typeof value === 'string') return Date.parse(value);
  if (value && typeof value === 'object' && 'seconds' in value) {
    return (
      Number(value.seconds) * 1000 +
      ('nanos' in value ? Number(value.nanos) / 1e6 : 0)
    );
  }
  return 0;
}

const encodedBytes = (value: unknown) => {
  if (value instanceof Uint8Array) return value.byteLength;
  if (typeof value !== 'string') return 0;
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((value.length * 3) / 4) - padding);
};

/** Wire size of encoded payloads, which is what history size limits count. */
export function payloadBytes(payloads: unknown): number | undefined {
  const list =
    payloads && typeof payloads === 'object' && 'payloads' in payloads
      ? payloads.payloads
      : undefined;
  if (!Array.isArray(list)) return undefined;
  return list.reduce<number>((sum, payload) => {
    const { data, metadata } = (payload ?? {}) as {
      data?: unknown;
      metadata?: Record<string, unknown>;
    };
    return (
      sum +
      encodedBytes(data) +
      Object.values(metadata ?? {}).reduce<number>(
        (total, value) => total + encodedBytes(value),
        0,
      )
    );
  }, 0);
}

export function summarizeRun(
  runId: string,
  first: HistoryEvent,
  last: HistoryEvent,
): ChainRun {
  const started = first.workflowExecutionStartedEventAttributes;
  if (!started) throw new Error('The start of this run is not available.');
  const continued = last.workflowExecutionContinuedAsNewEventAttributes;
  const status = continued
    ? 'Continued as new'
    : last.workflowExecutionCompletedEventAttributes
      ? 'Completed'
      : last.workflowExecutionFailedEventAttributes
        ? 'Failed'
        : last.workflowExecutionCanceledEventAttributes
          ? 'Canceled'
          : last.workflowExecutionTerminatedEventAttributes
            ? 'Terminated'
            : last.workflowExecutionTimedOutEventAttributes
              ? 'Timed out'
              : 'Running';
  return {
    runId,
    previousRunId: started.continuedExecutionRunId || undefined,
    // Retry and cron newExecutionRunIds deliberately do not become CaN edges.
    nextRunId: continued?.newExecutionRunId || undefined,
    startTime: eventTime(first.eventTime),
    closeTime: status === 'Running' ? undefined : eventTime(last.eventTime),
    status,
    eventCount: last.eventId,
    inputBytes: payloadBytes(started.input),
    firstRunId: started.firstExecutionRunId || undefined,
  };
}

export function buildChainSteps(
  events: HistoryEvent[],
  run: ChainRun,
  live?: LiveRunState,
): ChainStep[] {
  const steps = new Map<string, ChainStep>();
  updateChainSteps(steps, events);
  return finishChainSteps([...steps.values()], run, live);
}

/** Consume an ascending page, retaining only step metadata (never payloads). */
export function updateChainSteps(
  steps: Map<string, ChainStep>,
  events: HistoryEvent[],
) {
  for (const event of events) {
    const activity = event.activityTaskScheduledEventAttributes;
    const timer = event.timerStartedEventAttributes;
    if (activity || timer) {
      steps.set(event.eventId, {
        id: event.eventId,
        name:
          activity?.activityType?.name ||
          (timer ? `Timer ${timer.timerId}` : 'Activity'),
        kind: timer ? 'timer' : 'activity',
        status: timer ? 'Waiting' : 'Scheduled',
        startTime: eventTime(event.eventTime),
        lane: 0,
        activityId: activity?.activityId ?? undefined,
      });
      continue;
    }
    if (updateOtherChainStep(steps, event, eventTime(event.eventTime)))
      continue;
    const started = event.activityTaskStartedEventAttributes;
    if (started) {
      const step = steps.get(String(started.scheduledEventId));
      if (step) {
        step.status = 'Running';
        step.attempts = Number(started.attempt) || 1;
      }
    }
    const finished =
      event.activityTaskCompletedEventAttributes ||
      event.activityTaskFailedEventAttributes ||
      event.activityTaskTimedOutEventAttributes ||
      event.activityTaskCanceledEventAttributes;
    const timerFinished =
      event.timerFiredEventAttributes || event.timerCanceledEventAttributes;
    const id = finished?.scheduledEventId ?? timerFinished?.startedEventId;
    const step = id == null ? undefined : steps.get(String(id));
    if (step) {
      step.closeTime = eventTime(event.eventTime);
      step.status = event.activityTaskFailedEventAttributes
        ? 'Failed'
        : event.activityTaskTimedOutEventAttributes
          ? 'Timed out'
          : event.activityTaskCanceledEventAttributes ||
              event.timerCanceledEventAttributes
            ? 'Canceled'
            : 'Completed';
    }
  }
}

export function finishChainSteps(
  steps: ChainStep[],
  run: ChainRun,
  live?: LiveRunState,
): ChainStep[] {
  const lanes: number[] = [];
  const pending = new Map(
    live?.runId === run.runId && run.status === 'Running'
      ? live.pendingActivities.map((activity) => [
          activity.activityId,
          activity,
        ])
      : [],
  );
  for (const step of steps) {
    const activity = step.activityId && pending.get(step.activityId);
    // A describe response can race a completion; recorded terminal events win.
    if (activity && !step.closeTime) {
      const state = String(activity.state);
      step.attempts = Number(activity.attempt) || 1;
      step.maximumAttempts = Number(activity.maximumAttempts) || 0;
      step.lastFailure = activity.lastFailure?.message || undefined;
      step.lastAttemptStartedTime =
        eventTime(activity.lastStartedTime) || undefined;
      step.nextAttemptTime =
        eventTime(activity.nextAttemptScheduleTime) || undefined;
      step.status = activity.paused
        ? 'Paused'
        : state === '3' || state.endsWith('CANCEL_REQUESTED')
          ? 'Cancel requested'
          : state === '2' || state.endsWith('STARTED')
            ? 'Running'
            : step.attempts > 1
              ? 'Retrying'
              : 'Scheduled';
    }
    if (run.closeTime && !step.closeTime) {
      step.closeTime = run.closeTime;
      step.status = 'Interrupted';
      step.interruptedBy = run.status;
    }
    const available = lanes.findIndex((end) => end <= step.startTime);
    step.lane = available < 0 ? lanes.length : available;
    lanes[step.lane] = step.closeTime ?? Infinity;
  }
  return steps;
}

/** Ten individual runs, anchored by identity so backfill cannot move the window. */
export function chainRunWindow(runs: ChainRun[], endRunId = ''): ChainRun[] {
  if (!runs.length) return [];
  const anchor = runs.findIndex((run) => run.runId === endRunId);
  const end =
    anchor < 0 ? runs.length : Math.min(runs.length, Math.max(10, anchor + 1));
  return runs.slice(Math.max(0, end - 10), end);
}

export function formatChainDuration(milliseconds: number): string {
  const seconds = Math.max(0, milliseconds) / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export const chainWorkflowStatus = (status: string): WorkflowStatus =>
  (status === 'Continued as new'
    ? 'ContinuedAsNew'
    : status === 'Timed out'
      ? 'TimedOut'
      : status) as WorkflowStatus;
