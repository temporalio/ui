import { describe, expect, it } from 'vitest';

import { toEvent } from '$lib/models/event-history';

import {
  getPendingActivity,
  isAssociatedPendingActivity,
} from './pending-activities';

import pendingActivityWorkflow from '$fixtures/workflow.pending-activities.json';

const getScheduledEvent = (activityId: string) =>
  toEvent({
    eventId: '12',
    eventTime: '2024-04-10T13:15:26.790496Z',
    eventType: 'EVENT_TYPE_ACTIVITY_TASK_SCHEDULED',
    taskId: '1048648',
    activityTaskScheduledEventAttributes: {
      activityId: activityId,
      activityType: {
        name: 'fun-activity',
      },
      taskQueue: {
        name: 'demo',
        kind: 'TASK_QUEUE_KIND_NORMAL',
      },
      header: {},
      input: {
        payloads: [],
      },
      scheduleToCloseTimeout: '0s',
      scheduleToStartTimeout: '0s',
      startToCloseTimeout: '1s',
      heartbeatTimeout: '0s',
      workflowTaskCompletedEventId: '10',
      retryPolicy: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumInterval: '5s',
      },
      useCompatibleVersion: true,
    },
  });

describe('getPendingActivity', () => {
  it('should return pending activity if the event has activityId of same pending activityId', () => {
    const pendingActivities = pendingActivityWorkflow.pendingActivities;
    expect(getPendingActivity(getScheduledEvent('1'), pendingActivities)).toBe(
      pendingActivities[0],
    );
  });

  it('should return undefined if the event has different activityId of pending activityId', () => {
    const pendingActivities = pendingActivityWorkflow.pendingActivities;
    expect(getPendingActivity(getScheduledEvent('23'), pendingActivities)).toBe(
      undefined,
    );
  });
});

describe('isAssociatedPendingActivity', () => {
  it('should return true if the event has matching activityId of pending activity', () => {
    const pendingActivities = pendingActivityWorkflow.pendingActivities;
    expect(
      isAssociatedPendingActivity(getScheduledEvent('1'), pendingActivities[0]),
    ).toBe(true);
  });

  it('should return undefined if the event has different activityId of pending activityId', () => {
    const pendingActivities = pendingActivityWorkflow.pendingActivities;
    expect(
      isAssociatedPendingActivity(getScheduledEvent('1'), pendingActivities[1]),
    ).toBe(false);
  });

  it('should return undefined if the event has different activityId of pending activityId', () => {
    const pendingActivities = pendingActivityWorkflow.pendingActivities;
    expect(
      isAssociatedPendingActivity(
        getScheduledEvent('16'),
        pendingActivities[0],
      ),
    ).toBe(false);
  });
});
