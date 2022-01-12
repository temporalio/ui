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

const signalType = ['WorkflowExecutionSignaled'];

const markerType = ['MarkerRecorded'];

type CompactEventType = ActivityType | TimerType | SignalType | MarkerType;

type CompactEvent = HistoryEventWithId & {
  eventType: CompactEventType;
};

const isCompactEvent = (event: HistoryEventWithId): event is CompactEvent => {
  if (
    activityTypes.includes(event.eventType) ||
    isTimerEvent(event) ||
    isSignalEvent(event) ||
    isMarkerEvent(event)
  )
    return true;
  return false;
};

const isActivityScheduledEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return event.eventType === 'ActivityTaskScheduled';
};

const isTimerEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return timerTypes.includes(event.eventType);
};

const isSignalEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return signalType.includes(event.eventType);
};

const isMarkerEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return markerType.includes(event.eventType);
};

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

    if (isTimerEvent(event)) {
      this.id = event?.timerStartedEventAttributes?.timerId;
      this.name = `Timer ${event?.timerStartedEventAttributes?.timerId}`;
    }

    if (isSignalEvent(event)) {
      this.id = event?.id;
      this.name = `Signal ${event?.workflowExecutionSignaledEventAttributes?.signalName}`;
    }

    if (isMarkerEvent(event)) {
      this.id = event?.id;
      this.name = `Marker ${event?.markerRecordedEventAttributes?.markerName}`;
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
    if (
      isActivityScheduledEvent(event) ||
      isTimerEvent(event) ||
      isSignalEvent(event) ||
      isMarkerEvent(event)
    ) {
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
