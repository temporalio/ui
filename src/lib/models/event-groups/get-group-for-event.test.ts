import { describe, expect, it } from 'vitest';

import type {
  ActivityTaskCompletedEvent,
  ActivityTaskScheduledEvent,
  ActivityTaskStartedEvent,
} from '$lib/types/events';

import { getGroupForEvent, groupEvents } from '.';

const eventHistory = [
  {
    id: '5',
    eventId: '5',
    eventTime: '2022-03-10T16:47:09.220652296Z',
    eventType: 'ActivityTaskScheduled',
    version: '0',
    taskId: '1048699',
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
      header: {
        fields: {},
      },
      input: null,
      scheduleToCloseTimeout: '0s',
      scheduleToStartTimeout: '0s',
      startToCloseTimeout: '3600s',

      id: '4',
      heartbeatTimeout: '0s',
      workflowTaskCompletedEventId: '4',
      retryPolicy: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumInterval: '100s',
        maximumAttempts: 1,
        nonRetryableErrorTypes: [],
      },
    },
  } as unknown as ActivityTaskScheduledEvent,
  {
    eventId: '6',
    eventTime: '2022-03-10T16:47:09.226184379Z',
    eventType: 'ActivityTaskStarted',
    version: '0',
    taskId: '1048703',
    activityTaskStartedEventAttributes: {
      scheduledEventId: '5',
      identity: '14327@MacBook-Pro.local@',
      requestId: '772583b9-1cb4-41b7-8507-b4214d1bf972',
      attempt: 1,
      lastFailure: null,
    },
  } as unknown as ActivityTaskStartedEvent,
  {
    id: '7',
    eventId: '7',
    eventTime: '2022-03-10T16:47:09.231417213Z',
    eventType: 'ActivityTaskCompleted',
    version: '0',
    taskId: '1048704',
    activityTaskCompletedEventAttributes: {
      result: null,
      scheduledEventId: '5',
      startedEventId: '6',
      identity: '14327@MacBook-Pro.local@',
    },
  } as unknown as ActivityTaskCompletedEvent,
];

const [activityTaskScheduled, activityTaskStarted, activityTaskCompleted] =
  eventHistory;
const eventGroups = groupEvents(eventHistory);
const [eventGroup] = eventGroups;

describe('getGroupForEvent', () => {
  it('should get ActivityScheduledEvent', () => {
    const result = getGroupForEvent(activityTaskScheduled, eventGroups);
    expect(result).toBe(eventGroup);
  });

  it('should get ActivityStartedEvent', () => {
    const result = getGroupForEvent(activityTaskStarted, eventGroups);
    expect(result).toBe(eventGroup);
  });

  it('should get ActivityCompletedEvent', () => {
    const result = getGroupForEvent(activityTaskCompleted, eventGroups);
    expect(result).toBe(eventGroup);
  });

  it('should return undefined if an event is not in a group', () => {
    const anotherEvent = {
      id: '8',
      eventId: '8',
      eventTime: '2022-03-10T16:47:09.231417213Z',
      eventType: 'ActivityTaskCompleted',
      version: '0',
      taskId: '1048704',
      activityTaskCompletedEventAttributes: {
        result: null,
        scheduledEventId: '1',
        startedEventId: '2',
        identity: '14327@MacBook-Pro.local@',
      },
    } as unknown as ActivityTaskCompletedEvent;

    const result = getGroupForEvent(anotherEvent, eventGroups);

    expect(result).toBe(undefined);
  });
});
