import { describe, expect, it } from 'vitest';

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
  makeChildWorkflowStarted,
  makeLocalActivityMarker,
  makeNexusOperationGroup,
  makeNexusOperationScheduled,
  makeNexusOperationStarted,
  makeStartChildWorkflowInitiated,
  makeTimerGroup,
  makeWorkflowStarted,
  makeWorkflowUpdateGroup,
} from '$lib/services/test-helpers/synthetic-events';
import type { HistoryEvent, PendingActivity } from '$lib/types/events';

import {
  getFailedOrPendingEvents,
  getFailedOrPendingGroups,
  isFailedOrPendingGroup,
  isSucceededGroup,
} from './get-failed-or-pending';

const completedEvent = {
  classification: 'Completed',
  eventType: 'test',
};
const failedEvent = {
  classification: 'Failed',
  eventType: 'test',
};
const timedOutEvent = {
  classification: 'TimedOut',
  eventType: 'test',
};
const canceledEvent = {
  classification: 'Canceled',
  eventType: 'test',
};
const terminatedEvent = {
  classification: 'Terminated',
  eventType: 'test',
};
const pendingActivity = {
  activityType: { name: 'test' },
};
const failedLocalEvent = {
  eventType: 'test',
  markerRecordedEventAttributes: {
    markerName: 'LocalActivity',
    failure: true,
  },
};

const failedUpdate = (id: number): HistoryEvent[] => {
  const [accepted, completed] = makeWorkflowUpdateGroup(id);
  return [
    accepted,
    {
      ...completed,
      workflowExecutionUpdateCompletedEventAttributes: {
        ...completed.workflowExecutionUpdateCompletedEventAttributes,
        outcome: { failure: { message: 'rejected' } },
      },
    } as HistoryEvent,
  ];
};

describe('getFailedOrPendingEvents', () => {
  it('should return all items if not filtering for failed event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, failedEvent],
      false,
    );
    expect(filteredEvents.length).toEqual(2);
  });
  it('should return no items if no failed/timedout/pending events', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, canceledEvent, terminatedEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(0);
  });
  it('should return filtered items for failed event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, failedEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(1);
  });
  it('should return filtered items for timed out event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, timedOutEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(1);
  });
  it('should return filtered items for an update that completed with a failure', () => {
    const [, failedUpdateCompleted] = failedUpdate(2);
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, failedUpdateCompleted],
      true,
    );
    expect(filteredEvents).toEqual([failedUpdateCompleted]);
  });
  it('should return filtered items for pending events', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, pendingActivity, pendingActivity],
      true,
    );
    expect(filteredEvents.length).toEqual(2);
  });
  it('should return filtered items for failed local event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, failedLocalEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(1);
  });
});

const withType = (
  event: HistoryEvent,
  eventType: string,
  attributes: Record<string, unknown>,
): HistoryEvent => ({ ...event, eventType, ...attributes }) as HistoryEvent;

const failedActivity = (startId: number): HistoryEvent[] => [
  makeActivityScheduled(startId),
  makeActivityStarted(startId + 1, startId),
  withType(makeWorkflowStarted(startId + 2), 'ActivityTaskFailed', {
    activityTaskFailedEventAttributes: {
      scheduledEventId: String(startId),
      startedEventId: String(startId + 1),
      failure: { message: 'boom' },
    },
  }),
];

const canceledActivity = (startId: number): HistoryEvent[] => [
  makeActivityScheduled(startId),
  makeActivityStarted(startId + 1, startId),
  withType(makeWorkflowStarted(startId + 2), 'ActivityTaskCanceled', {
    activityTaskCanceledEventAttributes: {
      scheduledEventId: String(startId),
      startedEventId: String(startId + 1),
    },
  }),
];

const failedChildWorkflow = (startId: number): HistoryEvent[] => [
  makeStartChildWorkflowInitiated(startId),
  makeChildWorkflowStarted(startId + 1, startId),
  withType(makeWorkflowStarted(startId + 2), 'ChildWorkflowExecutionFailed', {
    childWorkflowExecutionFailedEventAttributes: {
      initiatedEventId: String(startId),
      startedEventId: String(startId + 1),
      failure: { message: 'boom' },
    },
  }),
];

const failedNexusOperation = (startId: number): HistoryEvent[] => [
  makeNexusOperationScheduled(startId),
  makeNexusOperationStarted(startId + 1, startId),
  withType(makeWorkflowStarted(startId + 2), 'NexusOperationFailed', {
    nexusOperationFailedEventAttributes: {
      scheduledEventId: String(startId),
      failure: { message: 'boom' },
    },
  }),
];

const failedLocalActivity = (eventId: number): HistoryEvent[] => {
  const marker = makeLocalActivityMarker(eventId);
  return [
    {
      ...marker,
      markerRecordedEventAttributes: {
        ...marker.markerRecordedEventAttributes,
        failure: { message: 'boom' },
      },
    } as HistoryEvent,
  ];
};

const signal = (eventId: number): HistoryEvent[] => [
  withType(makeWorkflowStarted(eventId), 'WorkflowExecutionSignaled', {
    workflowExecutionSignaledEventAttributes: { signalName: 'signal' },
  }),
];

const lazyGroupFor = (
  events: HistoryEvent[],
  pendingActivities: PendingActivity[] = [],
): LazyGroup => {
  const buffer = createGroupedEventBuffer();
  for (const event of events) {
    buffer.ingestHistoryEvent(event);
  }
  buffer.setPendingMetadata(pendingActivities, []);
  const [group] = buffer.getLazyGroups();
  return group;
};

const pendingActivityFor = (activityId: string) =>
  ({ activityId, activityType: { name: 'TestActivity' } }) as PendingActivity;

const groupTypes = [
  ['LazyGroup', (group: LazyGroup) => group],
  ['EventGroup', (group: LazyGroup) => materializeGroup(group)],
] as const;

describe.each(groupTypes)('isFailedOrPendingGroup (%s)', (_, asGroup) => {
  const matches = (
    events: HistoryEvent[],
    pendingActivities: PendingActivity[] = [],
  ) => isFailedOrPendingGroup(asGroup(lazyGroupFor(events, pendingActivities)));

  it('matches an activity that failed', () => {
    expect(matches(failedActivity(2))).toBe(true);
  });

  it('matches an activity that timed out', () => {
    expect(matches(makeActivityTimeoutGroup(2))).toBe(true);
  });

  it('matches a child workflow that failed', () => {
    expect(matches(failedChildWorkflow(2))).toBe(true);
  });

  it('matches a Nexus operation that failed', () => {
    expect(matches(failedNexusOperation(2))).toBe(true);
  });

  it('matches an update that completed with a failure', () => {
    expect(matches(failedUpdate(2))).toBe(true);
  });

  it('does not match an update that completed', () => {
    expect(matches(makeWorkflowUpdateGroup(2))).toBe(false);
  });

  it('matches a failed local activity', () => {
    expect(matches(failedLocalActivity(2))).toBe(true);
  });

  it('matches a pending activity', () => {
    expect(
      matches(
        [makeActivityScheduled(2), makeActivityStarted(3, 2)],
        [pendingActivityFor('2')],
      ),
    ).toBe(true);
  });

  it('does not match a completed activity', () => {
    expect(matches(makeActivityGroup(2))).toBe(false);
  });

  it('does not match a canceled activity', () => {
    expect(matches(canceledActivity(2))).toBe(false);
  });
});

describe.each(groupTypes)('isSucceededGroup (%s)', (_, asGroup) => {
  const succeeded = (
    events: HistoryEvent[],
    pendingActivities: PendingActivity[] = [],
  ) => isSucceededGroup(asGroup(lazyGroupFor(events, pendingActivities)));

  it.each([
    ['an activity', makeActivityGroup(2)],
    ['a child workflow', makeChildWorkflowGroup(2)],
    ['a Nexus operation', makeNexusOperationGroup(2)],
    ['an update', makeWorkflowUpdateGroup(2)],
    ['a local activity', [makeLocalActivityMarker(2)]],
  ])('counts %s that completed', (__, events) => {
    expect(succeeded(events)).toBe(true);
  });

  it.each([
    ['a failed local activity', failedLocalActivity(2)],
    ['a canceled activity', canceledActivity(2)],
    ['a timed-out activity', makeActivityTimeoutGroup(2)],
    ['a failed activity', failedActivity(2)],
    ['a failed child workflow', failedChildWorkflow(2)],
    ['a failed Nexus operation', failedNexusOperation(2)],
    ['a timer', makeTimerGroup(2)],
    ['a signal', signal(2)],
  ])('does not count %s', (__, events) => {
    expect(succeeded(events)).toBe(false);
  });

  it('does not count an update that completed with a failure', () => {
    expect(succeeded(failedUpdate(2))).toBe(false);
  });

  it('does not count an open activity', () => {
    expect(
      succeeded(
        [makeActivityScheduled(2), makeActivityStarted(3, 2)],
        [pendingActivityFor('2')],
      ),
    ).toBe(false);
  });

  it('does not count a terminated child workflow', () => {
    expect(
      succeeded([
        makeStartChildWorkflowInitiated(2),
        makeChildWorkflowStarted(3, 2),
        withType(makeWorkflowStarted(4), 'ChildWorkflowExecutionTerminated', {
          childWorkflowExecutionTerminatedEventAttributes: {
            initiatedEventId: '2',
            startedEventId: '3',
          },
        }),
      ]),
    ).toBe(false);
  });

  it('does not count an `other` group', () => {
    expect(
      succeeded([
        withType(makeWorkflowStarted(2), 'MarkerRecorded', {
          markerRecordedEventAttributes: { markerName: 'Version' },
        }),
      ]),
    ).toBe(false);
  });
});

describe('getFailedOrPendingGroups', () => {
  const completed = lazyGroupFor(makeActivityGroup(2));
  const timedOut = lazyGroupFor(makeActivityTimeoutGroup(2));

  it('returns every group when not filtering', () => {
    expect(getFailedOrPendingGroups([completed, timedOut], false)).toEqual([
      completed,
      timedOut,
    ]);
  });

  it('keeps only failed and pending groups when filtering', () => {
    expect(getFailedOrPendingGroups([completed, timedOut], true)).toEqual([
      timedOut,
    ]);
  });
});
