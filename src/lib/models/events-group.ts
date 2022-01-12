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

const timerTypes = ['TimerStarted', 'TimerCanceled', 'TimerFired'];

type CompactEvent = HistoryEventWithId & {
  eventType: ActivityType | TimerType;
};

const isCompactEvent = (event: HistoryEventWithId): event is CompactEvent => {
  if (
    activityTypes.includes(event.eventType) ||
    timerTypes.includes(event.eventType)
  )
    return true;
  return false;
};

const isActivityScheduledEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return event.eventType === 'ActivityTaskScheduled';
};

const isTimerStartedEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return event.eventType === 'TimerStarted';
};

type CompactEventType = ActivityType | TimerType;

export class EventsGroup {
  id: string;
  name: string;
  private _events: Map<CompactEventType, HistoryEventWithId> = new Map();

  constructor(event: CompactEvent) {
    if (isActivityScheduledEvent) {
      this.id = event?.activityTaskScheduledEventAttributes?.activityId;
      this.name =
        event?.activityTaskScheduledEventAttributes?.activityType?.name;
    }

    if (isTimerStartedEvent(event)) {
      this.id = event?.timerStartedEventAttributes?.timerId;
      this.name = `Timer ${event?.timerStartedEventAttributes?.timerId}`;
    }

    this.set(event.eventType, event);
  }

  set(type: CompactEventType, event: HistoryEventWithId): void {
    this._events.set(type, event);
  }

  get(type: CompactEventType): HistoryEventWithId {
    return this._events.get(type);
  }

  toArray(): HistoryEventWithId[] {
    return [...this];
  }

  get events(): HistoryEventWithId[] {
    return [...this];
  }

  get length(): number {
    return this._events.size;
  }

  get last(): HistoryEventWithId {
    let last: HistoryEventWithId;

    for (const event of this) {
      last = event;
    }

    return last;
  }

  [Symbol.iterator](): IterableIterator<HistoryEventWithId> {
    return this._events.values();
  }
}

export class EventGroups {
  private _groups: Map<string, EventsGroup> = new Map();

  static async fromPromise(
    events: PromiseLike<HistoryEventWithId[]>,
  ): Promise<EventGroups> {
    return EventGroups.from(await events);
  }

  static from = (
    events: HistoryEventWithId[],
    groups = new EventGroups(),
  ): EventGroups => {
    for (const event of events) {
      if (isCompactEvent(event)) {
        groups.add(event);
      }
    }

    return groups;
  };

  constructor(event?: CompactEvent | HistoryEventWithId[]) {
    if (Array.isArray(event)) return EventGroups.from(event, this);
    if (event) this.add(event);
  }

  get(id: string | number | Long): EventsGroup {
    return this._groups.get(String(id));
  }

  add(event: CompactEvent): void {
    if (isActivityScheduledEvent(event)) {
      const id = String(event.id);
      this._groups.set(id, new EventsGroup(event));
    }

    if (event.eventType === 'ActivityTaskStarted') {
      const { scheduledEventId } = event.activityTaskStartedEventAttributes;
      this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskCanceled') {
      const { scheduledEventId } = event.activityTaskCanceledEventAttributes;
      this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskCancelRequested') {
      const { scheduledEventId } =
        event.activityTaskCancelRequestedEventAttributes;
      this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskFailed') {
      const { scheduledEventId } = event.activityTaskFailedEventAttributes;
      this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskTimedOut') {
      const { scheduledEventId } = event.activityTaskTimedOutEventAttributes;
      this.get(scheduledEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskCompleted') {
      const { scheduledEventId } = event.activityTaskCompletedEventAttributes;
      this.get(scheduledEventId).set(event.eventType, event);
    }

    if (isTimerStartedEvent(event)) {
      const id = String(event.id);
      this._groups.set(id, new EventsGroup(event));
    }
  }

  get length(): number {
    return this._groups.size;
  }

  slice(...args: Parameters<typeof Array.prototype.slice>): EventsGroup[] {
    return [...this].slice(...args);
  }

  [Symbol.iterator](): IterableIterator<EventsGroup> {
    return this._groups.values();
  }
}
