type ScheduledActivityEvent = HistoryEventWithId & {
  eventType: 'ActivityTaskScheduled';
};

const activityTypes = [
  'ActivityTaskCanceled',
  'ActivityTaskCancelRequested',
  'ActivityTaskCompleted',
  'ActivityTaskFailed',
  'ActivityTaskScheduled',
  'ActivityTaskStarted',
  'ActivityTaskTimedOut',
];

const isActivity = (event: HistoryEventWithId): event is ActivityEvent => {
  if (activityTypes.includes(event.eventType)) return true;
  return false;
};

const isActivityScheduledEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return event.eventType === 'ActivityTaskScheduled';
};

export class Activity {
  id: string;
  name: string;
  private _events: Map<ActivityType, HistoryEventWithId> = new Map();

  constructor(event: ScheduledActivityEvent) {
    this.id = event?.activityTaskScheduledEventAttributes?.activityId;
    this.name = event?.activityTaskScheduledEventAttributes?.activityType?.name;

    this.set(event.eventType, event);
  }

  set(type: ActivityType, event: HistoryEventWithId) {
    this._events.set(type, event);
  }

  get(type: ActivityType): HistoryEventWithId {
    return this._events.get(type);
  }

  get events(): typeof this._events {
    return this._events;
  }

  get length(): number {
    return this.events.size;
  }

  [Symbol.iterator]() {
    return this._events.values();
  }
}

export class Activities {
  private _activities: Map<string, Activity> = new Map();

  static from = (
    events: HistoryEventWithId[],
    activities = new Activities(),
  ): Activities => {
    for (const event of events) {
      if (isActivity(event)) {
        activities.add(event);
      }
    }

    return activities;
  };

  constructor(event?: ActivityEvent | HistoryEventWithId[]) {
    if (Array.isArray(event)) return Activities.from(event, this);
    if (event) this.add(event);
  }

  get(id: string | number | Long) {
    return this._activities.get(String(id));
  }

  add(event: ActivityEvent) {
    if (isActivityScheduledEvent(event)) {
      const id = String(event.id);
      return this._activities.set(id, new Activity(event));
    }

    if (event.eventType === 'ActivityTaskStarted') {
      const { scheduledEventId } = event.activityTaskStartedEventAttributes;
      return this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskCanceled') {
      const { scheduledEventId } = event.activityTaskCanceledEventAttributes;
      return this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskCancelRequested') {
      const { scheduledEventId } =
        event.activityTaskCancelRequestedEventAttributes;
      return this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskFailed') {
      const { scheduledEventId } = event.activityTaskFailedEventAttributes;
      return this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskTimedOut') {
      const { scheduledEventId } = event.activityTaskTimedOutEventAttributes;
      return this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskCompleted') {
      const { scheduledEventId } = event.activityTaskCompletedEventAttributes;
      return this.get(scheduledEventId).set(event.eventType, event);
    }
  }

  get length(): number {
    return this._activities.size;
  }

  [Symbol.iterator]() {
    return this._activities.values();
  }
}
