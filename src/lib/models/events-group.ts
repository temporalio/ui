type ScheduledActivityEvent = HistoryEventWithId & {
  eventType: 'ActivityTaskScheduled';
};

type CompactEventType =
  | ActivityType
  | TimerType
  | SignalType
  | MarkerType
  | ChildType;

type CompactEvent = HistoryEventWithId & {
  eventType: CompactEventType;
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
const signalTypes = ['WorkflowExecutionSignaled'];
const markerTypes = ['MarkerRecorded'];

const childTypes = [
  'StartChildWorkflowExecutionInitiated',
  'ChildWorkflowExecutionStarted',
  'ChildWorkflowExecutionCompleted',
];

const isCompactEvent = (event: HistoryEventWithId): event is CompactEvent => {
  if (
    activityTypes.includes(event.eventType) ||
    timerTypes.includes(event.eventType) ||
    isSignalEvent(event) ||
    isMarkerEvent(event) ||
    childTypes.includes(event.eventType)
  )
    return true;
  return false;
};

const isActivityScheduledEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return event.eventType === 'ActivityTaskScheduled';
};

const isChildWorkflowInitializedEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return event.eventType === 'StartChildWorkflowExecutionInitiated';
};

const isTimerStartedEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return event.eventType === 'TimerStarted';
};

const isSignalEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return signalTypes.includes(event.eventType);
};

const isMarkerEvent = (
  event: HistoryEventWithId,
): event is ScheduledActivityEvent => {
  return markerTypes.includes(event.eventType);
};

export class EventsGroup {
  id: string;
  name: string;
  private _events: Map<CompactEventType, HistoryEventWithId> = new Map();

  constructor(event: CompactEvent) {
    if (isActivityScheduledEvent(event)) {
      this.id = event?.activityTaskScheduledEventAttributes?.activityId;
      this.name =
        event?.activityTaskScheduledEventAttributes?.activityType?.name;
    }

    if (isTimerStartedEvent(event)) {
      this.id = event.id;
      this.name = `Timer ${event?.timerStartedEventAttributes?.timerId}`;
    }

    if (isSignalEvent(event)) {
      this.id = event.id;
      this.name = `Signal: ${event?.workflowExecutionSignaledEventAttributes?.signalName}`;
    }

    if (isMarkerEvent(event)) {
      this.id = event.id;
      this.name = `Marker: ${event?.markerRecordedEventAttributes?.markerName}`;
    }

    if (isChildWorkflowInitializedEvent(event)) {
      this.id = event.id;
      this.name = `Child Workflow: ${event?.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType?.name}`;
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
      isTimerStartedEvent(event) ||
      isSignalEvent(event) ||
      isMarkerEvent(event) ||
      isChildWorkflowInitializedEvent(event)
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

    if (event.eventType === 'ChildWorkflowExecutionStarted') {
      const { initiatedEventId } =
        event.childWorkflowExecutionStartedEventAttributes;
      this.get(initiatedEventId).set(event.eventType, event);
    }

    if (event.eventType === 'ChildWorkflowExecutionCompleted') {
      const { initiatedEventId } =
        event.childWorkflowExecutionCompletedEventAttributes;
      this.get(initiatedEventId).set(event.eventType, event);
    }

    if (event.eventType === 'TimerFired') {
      const { startedEventId } = event.timerFiredEventAttributes;
      this.get(startedEventId).set(event.eventType, event);
    }

    if (event.eventType === 'TimerCanceled') {
      const { startedEventId } = event.timerCanceledEventAttributes;
      this.get(startedEventId).set(event.eventType, event);
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
