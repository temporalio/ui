import { describe, expect, it } from 'vitest';

import type { WorkflowEvents } from '$lib/types/events';

import { groupEvents } from '.';
import { getLastEvent } from './get-last-event';

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

const [eventGroup] = groupEvents(eventHistory);

describe('getLastEvent', () => {
  it('should return the last event if the events are arranged in ascending order', () => {
    const lastEvent = getLastEvent(eventGroup);
    expect(lastEvent.id).toBe('7');
  });
});
