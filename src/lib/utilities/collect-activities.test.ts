import { collectActivities } from './collect-activities';

const eventHistory = [
  {
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
      header: {
        fields: {},
      },
      input: null,
      scheduleToCloseTimeout: '0s',
      scheduleToStartTimeout: '0s',
      startToCloseTimeout: '3600s',
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
  },
  {
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
  },
  {
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
  },
];

describe(collectActivities, () => {
  it('have the activity name', () => {
    const result = collectActivities(eventHistory);
    const activity = result[5];

    expect(activity.name).toBe('CompletedActivity');
  });

  it('should have a key with the ID of the ActivityTaskScheduledEvent', () => {
    const result = collectActivities(eventHistory);
    expect(result[5]).toBeDefined();
  });

  it('should have a scheduled activity of the first event', () => {
    const [activityScheduled] = eventHistory;
    const result = collectActivities(eventHistory);
    const activity = result[5];

    expect(activity.events.ActivityTaskScheduled).toBe(activityScheduled);
  });

  it('should have a scheduled activity of the first event', () => {
    const [, activityStarted] = eventHistory;
    const result = collectActivities(eventHistory);
    const activity = result[5];

    expect(activity.events.ActivityTaskStarted).toBe(activityStarted);
  });

  it('should have a scheduled activity of the first event', () => {
    const [, , activityCompleted] = eventHistory;
    const result = collectActivities(eventHistory);
    const activity = result[5];

    expect(activity.events.ActivityTaskCompleted).toBe(activityCompleted);
  });
});
