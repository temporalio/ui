import { getName } from '$lib/utilities/get-event-name';

import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';

type Groupings = {
  ActivityTaskScheduled: ActivityTaskScheduledEvent;
  StartChildWorkflowExecutionInitiated: StartChildWorkflowExecutionInitiatedEvent;
  TimerStarted: TimerStartedEvent;
  SignalExternalWorkflowExecutionInitiated: SignalExternalWorkflowExecutionInitiatedEvent;
  MarkerRecorded: MarkerRecordedEvent;
};

const _create =
  <E extends keyof Groupings, T extends Groupings[E]>(eventType: E) =>
  (event: T): CompactEventGroup => {
    const id = event.id;
    const name = getName(event);

    const events = new Map<EventType, HistoryEventWithId>();

    events.set(event.eventType, event);

    return { id, name, events };
  };

const createGroupFor = {
  activity: _create('ActivityTaskScheduled'),
  childWorkflow: _create('StartChildWorkflowExecutionInitiated'),
  timer: _create('TimerStarted'),
  signal: _create('SignalExternalWorkflowExecutionInitiated'),
  marker: _create('MarkerRecorded'),
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
