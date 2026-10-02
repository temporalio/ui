import { describe, expect, it } from 'vitest';

import type { TimelineGroup } from '$lib/services/chain-workflow-session';
import type { LazyGroup } from '$lib/services/grouped-event-buffer';
import type { WorkflowEvent } from '$lib/types/events';

import {
  getWorkerWait,
  isWorkerWaitKey,
  withWorkerWaitGroups,
  workerWaitSourceKey,
} from './timeline-worker-wait';

const T0 = Date.UTC(2026, 9, 9, 12, 0, 0);

const activity = (overrides: Partial<LazyGroup> = {}): LazyGroup =>
  ({
    id: '5',
    eventCount: 3,
    startTimeMs: T0,
    lastTimeMs: T0 + 9_000,
    initialEvent: { id: '5', eventTime: new Date(T0).toISOString() },
    lastEvent: { id: '9' },
    category: 'activity',
    classification: 'Completed',
    finalClassification: 'Completed',
    isPending: false,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    activityStartedTimeMs: T0 + 8_000,
    activityAttempt: 1,
    ...overrides,
  }) as unknown as LazyGroup;

const entry = (group: LazyGroup, ordinal: number): TimelineGroup => ({
  timelineKey: `run-1:${group.id}`,
  runId: 'run-1',
  ordinal,
  group,
});

describe('getWorkerWait', () => {
  it('measures an activity that sat scheduled before a worker started it', () => {
    expect(getWorkerWait(activity(), T0 + 20_000)).toEqual({
      startTimeMs: T0,
      endTimeMs: T0 + 8_000,
    });
  });

  it('ignores normal dispatch latency', () => {
    expect(
      getWorkerWait(activity({ activityStartedTimeMs: T0 + 40 }), T0 + 20_000),
    ).toBeUndefined();
  });

  it('ignores retries, whose gap holds earlier attempts and backoff', () => {
    expect(
      getWorkerWait(activity({ activityAttempt: 3 }), T0 + 20_000),
    ).toBeUndefined();
  });

  it('keeps a wait open while the activity is still unstarted', () => {
    const waiting = activity({
      isPending: true,
      activityStartedTimeMs: undefined,
      eventCount: 1,
    });
    expect(getWorkerWait(waiting, T0 + 5_000)).toEqual({ startTimeMs: T0 });
    expect(getWorkerWait(waiting, T0 + 200)).toBeUndefined();
  });

  it('leaves other kinds of events alone', () => {
    expect(
      getWorkerWait(
        activity({ category: 'timer' as WorkflowEvent['category'] }),
        T0 + 20_000,
      ),
    ).toBeUndefined();
  });
});

describe('withWorkerWaitGroups', () => {
  it('puts a waiting row just before its activity and renumbers places', () => {
    const quick = activity({ id: '2', activityStartedTimeMs: T0 + 20 });
    const slow = activity({ id: '5' });
    const groups = withWorkerWaitGroups(
      [entry(quick, 0), entry(slow, 1)],
      T0 + 20_000,
    );
    expect(groups?.map((group) => group.timelineKey)).toEqual([
      'run-1:2',
      'run-1:5:waiting',
      'run-1:5',
    ]);
    expect(groups?.map((group) => group.ordinal)).toEqual([0, 1, 2]);
    const wait = groups?.[1].group as LazyGroup;
    expect(wait.timelineDisplayName).toBe('Waiting for a worker');
    expect([wait.startTimeMs, wait.lastTimeMs]).toEqual([T0, T0 + 8_000]);
  });

  it("starts the activity's own bar when a worker picked it up", () => {
    const slow = activity({
      eventPoints: [
        { eventId: 5, timeMs: T0, classification: 'Scheduled' },
        { eventId: 6, timeMs: T0 + 8_000, classification: 'Started' },
        { eventId: 7, timeMs: T0 + 9_000, classification: 'Completed' },
      ],
    });
    const groups = withWorkerWaitGroups([entry(slow, 0)], T0 + 20_000);
    const own = groups?.[1].group as LazyGroup;
    expect(own.eventPoints?.map((point) => point.timeMs)).toEqual([
      T0 + 8_000,
      T0 + 8_000,
      T0 + 9_000,
    ]);
    expect(own.startTimeMs).toBe(T0);
  });

  it('returns nothing when no activity waited, so runs stay as they were', () => {
    expect(
      withWorkerWaitGroups(
        [entry(activity({ activityStartedTimeMs: T0 + 20 }), 0)],
        T0 + 20_000,
      ),
    ).toBeUndefined();
  });

  it('maps a waiting row back to its activity', () => {
    expect(isWorkerWaitKey('run-1:5:waiting')).toBe(true);
    expect(workerWaitSourceKey('run-1:5:waiting')).toBe('run-1:5');
    expect(workerWaitSourceKey('run-1:5')).toBe('run-1:5');
  });
});
