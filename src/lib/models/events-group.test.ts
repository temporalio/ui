import { EventsGroup, EventGroups } from './events-group';

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
];

describe(EventsGroup, () => {
  it('should grab the name of the groupTaskScheduledEvent', () => {
    const group = new EventsGroup(scheduledEvent);

    expect(group.name).toBe('CompletedActivity');
  });

  it('should grab the id of the groupTaskScheduledEvent', () => {
    const group = new EventsGroup(scheduledEvent);

    expect(group.id).toBe('5');
  });

  it('should store the groupTaskScheduled', () => {
    const group = new EventsGroup(scheduledEvent);

    expect(group.get('ActivityTaskScheduled')).toBe(scheduledEvent);
  });

  it('should be able to add a started event', () => {
    const group = new EventsGroup(scheduledEvent);
    group.set(completedEvent.eventType, completedEvent);

    expect(group.length).toBe(2);
    expect(group.get('ActivityTaskCompleted')).toBe(completedEvent);
  });
});

describe(EventsGroup, () => {
  it('should create a new entry when given an groupTaskScheduled event', () => {
    const groups = new EventGroups();

    groups.add(scheduledEvent);

    const group = groups.get(scheduledEvent.id);

    expect(group.get('ActivityTaskScheduled')).toBe(scheduledEvent);
  });

  it('should correctly set the name of the events group', () => {
    const groups = new EventGroups();

    groups.add(scheduledEvent);

    const group = groups.get(scheduledEvent.id);

    expect(group.name).toBe('CompletedActivity');
  });

  it('should correctly set the id of the group', () => {
    const groups = new EventGroups();

    groups.add(scheduledEvent);

    const group = groups.get(scheduledEvent.id);

    expect(group.id).toBe('5');
  });

  it('should correctly set the name of the group', () => {
    const groups = new EventGroups();

    groups.add(scheduledEvent);

    const group = groups.get(scheduledEvent.id);

    expect(group.id).toBe('5');
  });

  it('should be able to store multiple event groups', () => {
    const groups = new EventGroups();

    groups.add(scheduledEvent);
    groups.add(anotherScheduledEvent);

    expect(groups.length).toBe(2);
  });

  it('should add a completed event to the correct group', () => {
    const groups = new EventGroups();

    groups.add(scheduledEvent);
    groups.add(completedEvent);

    const group = groups.get(scheduledEvent.id);

    expect(group.length).toBe(2);
    expect(group.get('ActivityTaskCompleted')).toBe(completedEvent);
  });

  it('should be able to add multiple event groups and their associated events', () => {
    const groups = new EventGroups();

    groups.add(scheduledEvent);
    groups.add(startedEvent);
    groups.add(completedEvent);
    groups.add(anotherScheduledEvent);

    const [first, second] = groups;

    expect(groups.length).toBe(2);
    expect(first.length).toBe(3);
    expect(second.length).toBe(1);
  });

  describe('from event history', () => {
    it('should create a collection with the correct number of event groups', () => {
      const groups = EventGroups.from(eventHistory);

      const [first, second] = groups;

      expect(groups.length).toBe(2);
      expect(first.length).toBe(3);
      expect(second.length).toBe(1);
    });

    it('should create a collection with the correct number of event groups using the constructor', () => {
      const groups = new EventGroups(eventHistory);

      const [first, second] = groups;

      expect(groups.length).toBe(2);
      expect(first.length).toBe(3);
      expect(second.length).toBe(1);
    });

    it('should instantiate correctly when given a single event', () => {
      const groups = new EventGroups(scheduledEvent);

      const [group] = groups;

      expect(groups.length).toBe(1);
      expect(group.length).toBe(1);
    });
  });
});
