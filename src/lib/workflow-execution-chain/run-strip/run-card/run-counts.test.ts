import { describe, expect, it, vi } from 'vitest';

import { summarizeLifecycleGroups } from '$lib/models/event-history/timeline-event-groups';
import {
  createGroupedEventBuffer,
  type LazyGroup,
  materializeGroup,
} from '$lib/services/grouped-event-buffer';
import {
  makeActivityGroup,
  makeActivityScheduled,
  makeActivityStarted,
  makeActivityTimeoutGroup,
  makeChildWorkflowGroup,
  makeLocalActivityGroup,
  makeNexusOperationGroup,
  makeTimerGroup,
  makeWorkflowStarted,
  makeWorkflowTaskGroup,
  makeWorkflowUpdateGroup,
} from '$lib/services/test-helpers/synthetic-events';
import type { HistoryEvent } from '$lib/types/events';

import { countRunGroups } from './run-counts';

const groupsFor = (events: HistoryEvent[]) => {
  const buffer = createGroupedEventBuffer();
  for (const event of events) {
    buffer.ingestHistoryEvent(event);
  }
  return buffer.getLazyGroups();
};

const groupRecordPrototype = (groups: LazyGroup[]) =>
  Object.getPrototypeOf(groups[0]) as { materialize: () => unknown };

const signal = (eventId: number): HistoryEvent =>
  ({
    ...makeWorkflowStarted(eventId),
    eventType: 'WorkflowExecutionSignaled',
    workflowExecutionSignaledEventAttributes: { signalName: 'signal' },
  }) as HistoryEvent;

const retriedActivity = (startId: number, attempt: number): HistoryEvent[] => {
  const [scheduled, , completed] = makeActivityGroup(startId);
  const started = makeActivityStarted(startId + 1, startId);
  return [
    scheduled,
    {
      ...started,
      activityTaskStartedEventAttributes: {
        ...started.activityTaskStartedEventAttributes,
        attempt,
      },
    } as HistoryEvent,
    completed,
  ];
};

const failedActivity = (startId: number): HistoryEvent[] => [
  makeActivityScheduled(startId),
  makeActivityStarted(startId + 1, startId),
  {
    ...makeWorkflowStarted(startId + 2),
    eventType: 'ActivityTaskFailed',
    activityTaskFailedEventAttributes: {
      scheduledEventId: String(startId),
      startedEventId: String(startId + 1),
      failure: { message: 'boom' },
    },
  } as unknown as HistoryEvent,
];

describe('countRunGroups', () => {
  it('counts every category, failures and retries', () => {
    const groups = groupsFor([
      makeWorkflowStarted(1),
      ...makeWorkflowTaskGroup(2),
      ...retriedActivity(5, 3),
      ...makeLocalActivityGroup(8),
      ...makeTimerGroup(9),
      signal(11),
      ...makeChildWorkflowGroup(12),
      ...makeWorkflowUpdateGroup(15),
      ...makeNexusOperationGroup(17),
      ...makeActivityTimeoutGroup(20),
      ...failedActivity(22),
    ]);

    expect(countRunGroups(groups)).toEqual({
      activities: 4,
      childWorkflows: 1,
      timers: 1,
      signals: 1,
      nexusOperations: 1,
      updates: 1,
      failed: 2,
      retried: 2,
    });
  });

  it('counts local activities as activities', () => {
    const groups = groupsFor([
      makeWorkflowStarted(1),
      ...makeLocalActivityGroup(2),
      ...makeLocalActivityGroup(3),
    ]);

    expect(countRunGroups(groups).activities).toBe(2);
  });

  it('excludes workflow tasks', () => {
    const groups = groupsFor([
      makeWorkflowStarted(1),
      ...makeWorkflowTaskGroup(2),
      ...makeWorkflowTaskGroup(5),
    ]);

    expect(countRunGroups(groups)).toEqual({
      activities: 0,
      childWorkflows: 0,
      timers: 0,
      signals: 0,
      nexusOperations: 0,
      updates: 0,
      failed: 0,
      retried: 0,
    });
  });

  it('sums retries across groups', () => {
    const groups = groupsFor([
      makeWorkflowStarted(1),
      ...retriedActivity(2, 4),
      ...retriedActivity(5, 2),
      ...retriedActivity(8, 1),
    ]);

    expect(countRunGroups(groups).retried).toBe(4);
  });

  it('agrees with the timeline summary without materializing groups', () => {
    const groups = groupsFor([
      makeWorkflowStarted(1),
      ...retriedActivity(2, 3),
      ...makeActivityTimeoutGroup(5),
      ...failedActivity(7),
      ...makeTimerGroup(10),
    ]);
    const materialize = vi.spyOn(groupRecordPrototype(groups), 'materialize');

    const counts = countRunGroups(groups);
    expect(materialize).not.toHaveBeenCalled();
    materialize.mockRestore();

    const summary = summarizeLifecycleGroups(groups.map(materializeGroup));
    expect(counts.failed).toBe(summary.failed + summary.timedOut);
    expect(counts.retried).toBe(summary.retries);
  });

  it('counts failed and timed-out groups as failed', () => {
    const groups = groupsFor([
      makeWorkflowStarted(1),
      ...makeActivityTimeoutGroup(2),
      ...makeActivityTimeoutGroup(4),
      ...failedActivity(6),
    ]);

    expect(countRunGroups(groups).failed).toBe(3);
  });
});
