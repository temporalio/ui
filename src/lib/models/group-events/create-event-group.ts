import { getGroupId } from './get-group-id';

import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';
import { getLastEvent } from './get-last-event';

export const getName = (event: CommonHistoryEvent): string => {
  if (!event) return;

  if (isActivityTaskScheduledEvent(event)) {
    return event.activityTaskScheduledEventAttributes?.activityType?.name;
  }

  if (isTimerStartedEvent(event)) {
    return `Timer ${event.timerStartedEventAttributes?.timerId} (${event.timerStartedEventAttributes?.startToFireTimeout})`;
  }

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
    return `Signal: ${event.signalExternalWorkflowExecutionInitiatedEventAttributes?.signalName}`;
  }

  if (isWorkflowExecutionSignaledEvent(event)) {
    return `Signal received: ${event.workflowExecutionSignaledEventAttributes?.signalName}`;
  }

  if (isMarkerRecordedEvent(event)) {
    return `Marker: ${event.markerRecordedEventAttributes?.markerName}`;
  }

  if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
    return `Child Workflow: ${event.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType?.name}`;
  }
};

type StartingEvents = {
  Activity: ActivityTaskScheduledEvent;
  ChildWorkflow: StartChildWorkflowExecutionInitiatedEvent;
  Timer: TimerStartedEvent;
  Signal: SignalExternalWorkflowExecutionInitiatedEvent;
  SignalReceived: WorkflowExecutionSignaledEvent;
  Marker: MarkerRecordedEvent;
};

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K],
): CompactEventGroup => {
  const id = getGroupId(event);
  const name = getName(event);
  const { timestamp, category, classification } = event;

  const initialEvent = event;

  const events: CompactEventGroup['events'] = new Map();
  const eventIds: CompactEventGroup['eventIds'] = new Set();

  events.set(event.id, event);
  eventIds.add(event.id);

  return {
    id,
    name,
    events,
    eventIds,
    initialEvent,
    timestamp,
    category,
    classification,
    get eventTime() {
      return getLastEvent(this)?.eventTime;
    },
    get attributes() {
      return getLastEvent(this)?.attributes;
    },
  };
};

export const createEventGroup = (event: CommonHistoryEvent) => {
  if (isActivityTaskScheduledEvent(event))
    return createGroupFor<'Activity'>(event);

  if (isStartChildWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'ChildWorkflow'>(event);

  if (isTimerStartedEvent(event)) return createGroupFor<'Timer'>(event);

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'Signal'>(event);

  if (isWorkflowExecutionSignaledEvent(event))
    return createGroupFor<'SignalReceived'>(event);

  if (isMarkerRecordedEvent(event)) return createGroupFor<'Marker'>(event);
};
