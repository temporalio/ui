import { Activity, Activities } from './activity';

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

describe(Activity, () => {
  it('should grab the name of the ActivityTaskScheduledEvent', () => {
    const activity = new Activity(scheduledEvent);

    expect(activity.name).toBe('CompletedActivity');
  });

  it('should grab the id of the ActivityTaskScheduledEvent', () => {
    const activity = new Activity(scheduledEvent);

    expect(activity.id).toBe('5');
  });

  it('should store the ActivityTaskScheduled', () => {
    const activity = new Activity(scheduledEvent);

    expect(activity.get('ActivityTaskScheduled')).toBe(scheduledEvent);
  });

  it('should be able to add a started event', () => {
    const activity = new Activity(scheduledEvent);
    activity.set(completedEvent.eventType, completedEvent);

    expect(activity.length).toBe(2);
    expect(activity.get('ActivityTaskCompleted')).toBe(completedEvent);
  });
});

describe(Activity, () => {
  it('should create a new entry when given an ActivityTaskScheduled event', () => {
    const activities = new Activities();

    activities.add(scheduledEvent);

    const activity = activities.get(scheduledEvent.id);

    expect(activity.get('ActivityTaskScheduled')).toBe(scheduledEvent);
  });

  it('should correctly set the name of the activity', () => {
    const activities = new Activities();

    activities.add(scheduledEvent);

    const activity = activities.get(scheduledEvent.id);

    expect(activity.name).toBe('CompletedActivity');
  });

  it('should correctly set the id of the activity', () => {
    const activities = new Activities();

    activities.add(scheduledEvent);

    const activity = activities.get(scheduledEvent.id);

    expect(activity.id).toBe('5');
  });

  it('should correctly set the name of the activity', () => {
    const activities = new Activities();

    activities.add(scheduledEvent);

    const activity = activities.get(scheduledEvent.id);

    expect(activity.id).toBe('5');
  });

  it('should be able to store multiple activities', () => {
    const activities = new Activities();

    activities.add(scheduledEvent);
    activities.add(anotherScheduledEvent);

    expect(activities.length).toBe(2);
  });

  it('should add a completed event to the correct activity', () => {
    const activities = new Activities();

    activities.add(scheduledEvent);
    activities.add(completedEvent);

    const activity = activities.get(scheduledEvent.id);

    expect(activity.length).toBe(2);
    expect(activity.get('ActivityTaskCompleted')).toBe(completedEvent);
  });

  it('should be able to add multiple activities and their associated events', () => {
    const activities = new Activities();

    activities.add(scheduledEvent);
    activities.add(startedEvent);
    activities.add(completedEvent);
    activities.add(anotherScheduledEvent);

    const [first, second] = activities;

    expect(activities.length).toBe(2);
    expect(first.length).toBe(3);
    expect(second.length).toBe(1);
  });
});
