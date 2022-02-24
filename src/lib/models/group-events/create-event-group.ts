import { getName } from '$lib/utilities/get-event-name';
import { getGroupId } from './get-group-id';

import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';

type EventGroups = {
  Activity: ActivityEvent;
  ChildWorkflow: ChildEvent;
  Timer: TimerEvent;
  Signal: SignalEvent;
  Marker: MarkerEvent;
};

type StartingEvents = {
  Activity: ActivityTaskScheduledEvent;
  ChildWorkflow: StartChildWorkflowExecutionInitiatedEvent;
  Timer: TimerStartedEvent;
  Signal: SignalExternalWorkflowExecutionInitiatedEvent;
  Marker: MarkerRecordedEvent;
};

const _create =
  <K extends keyof StartingEvents>(kind: K) =>
  (event: StartingEvents[K]): CompactEventGroup => {
    const id = getGroupId(event);
    const name = getName(event);

    const events = new Map<EventType, HistoryEventWithId>();

    events.set(event.eventType, event);

    return { id, name, events };
  };

const a = (e: ActivityTaskScheduledEvent) => {
  const l = createGroupFor.activity(e);
  l.events;
};

const createGroupFor = {
  activity: _create('Activity'),
  childWorkflow: _create('ChildWorkflow'),
  timer: _create('Timer'),
  signal: _create('Signal'),
  marker: _create('Marker'),
};

export const createEventGroup = (event: CommonHistoryEvent) => {
  if (isActivityTaskScheduledEvent(event))
    return createGroupFor.activity(event);

  if (isStartChildWorkflowExecutionInitiatedEvent(event))
    return createGroupFor.childWorkflow(event);

  if (isTimerStartedEvent(event)) return createGroupFor.timer(event);

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event))
    return createGroupFor.signal(event);

  if (isMarkerRecordedEvent(event)) return createGroupFor.marker(event);
};
