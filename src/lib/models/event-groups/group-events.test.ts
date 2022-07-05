import { describe, expect, it } from 'vitest';
import { groupEvents } from './';

const scheduledEvent = {
  id: '5',
  eventId: '5',
  eventTime: '2021-12-27T15:23:21.806965200Z',
  eventType: 'ActivityTaskScheduled',
  version: '0',
  taskId: '1049493',
  activityTaskScheduledEventAttributes: {
    activityId: '5',
    activityType: {
      name: 'CompletedActivity',
    },
    namespace: '',
    taskQueue: {
      name: 'rainbow-statuses',
      kind: 'Normal',
    },
    input: null,
  },
};

const anotherScheduledEvent = {
  id: '99',
  eventId: '99',
  eventTime: '2021-12-27T15:23:21.806965200Z',
  eventType: 'ActivityTaskScheduled',
  version: '0',
  taskId: '1049494',
  activityTaskScheduledEventAttributes: {
    activityId: '5',
    activityType: {
      name: 'FicticiousEvent',
    },
    namespace: '',
    taskQueue: {
      name: 'test-events',
      kind: 'Normal',
    },
    input: null,
  },
};

const startedEvent = {
  id: '6',
  eventId: '6',
  eventTime: '2021-12-27T15:23:21.824600700Z',
  eventType: 'ActivityTaskStarted',
  version: '0',
  taskId: '1049497',
  activityTaskStartedEventAttributes: {
    scheduledEventId: '5',
    identity: '21665@temporal@',
    requestId: '0202572f-485c-426a-a3ee-02ea46d3cad7',
    attempt: 1,
    lastFailure: null,
  },
};

const completedEvent = {
  id: '7',
  eventId: '7',
  eventTime: '2021-12-27T15:23:21.841178500Z',
  eventType: 'ActivityTaskCompleted',
  version: '0',
  taskId: '1049498',
  activityTaskCompletedEventAttributes: {
    result: null,
    scheduledEventId: '5',
    startedEventId: '6',
    identity: '21665@temporal@',
  },
};

const eventHistory = [
  scheduledEvent,
  startedEvent,
  anotherScheduledEvent,
  completedEvent,
] as unknown as WorkflowEvents;

describe('groupEvents', () => {
  it('should create a new entry when given a scheduled event', () => {
    const groups = groupEvents([scheduledEvent] as unknown as WorkflowEvents);
    const group = groups.find(({ id }) => id === scheduledEvent.id);

    expect(group.events.get(scheduledEvent.id)).toBe(scheduledEvent);
  });

  it('should be able to store multiple event groups', () => {
    const groups = groupEvents([
      scheduledEvent,
      anotherScheduledEvent,
    ] as unknown as WorkflowEvents);

    expect(Object.keys(groups).length).toBe(2);
  });

  it('should add a completed event to the correct group', () => {
    const groups = groupEvents([
      scheduledEvent,
      completedEvent,
    ] as unknown as WorkflowEvents);

    const group = groups.find(({ id }) => id === scheduledEvent.id);

    expect(group.events.size).toBe(2);
    expect(group.events.get(completedEvent.id)).toBe(completedEvent);
  });

  it('should be able to add multiple event groups and their associated events', () => {
    const groups = groupEvents(eventHistory);

    const [first, second] = Object.values(groups);

    expect(Object.values(groups).length).toBe(2);
    expect(first.events.size).toBe(3);
    expect(second.events.size).toBe(1);
  });
});
