import type {
  ActivityTaskScheduledEvent,
  CommonHistoryEvent,
  MarkerRecordedEvent,
  SignalExternalWorkflowExecutionInitiatedEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  TimerStartedEvent,
  WorkflowExecutionSignaledEvent,
  WorkflowExecutionUpdateAcceptedEvent,
} from '$lib/types/events';
import {
  isActivityTaskScheduledEvent,
  isLocalActivityMarkerEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
} from '$lib/utilities/is-event-type';

import type { EventGroup } from './event-groups';
import {
  eventIsCanceled,
  eventIsFailureOrTimedOut,
  eventIsTerminated,
} from './get-event-in-group';
import { getGroupId } from './get-group-id';
import { getEventGroupName } from './get-group-name';
import { getLastEvent } from './get-last-event';

type StartingEvents = {
  Activity: ActivityTaskScheduledEvent;
  ChildWorkflow: StartChildWorkflowExecutionInitiatedEvent;
  Timer: TimerStartedEvent;
  Signal: SignalExternalWorkflowExecutionInitiatedEvent;
  SignalReceived: WorkflowExecutionSignaledEvent;
  LocalActivity: MarkerRecordedEvent;
  Marker: MarkerRecordedEvent;
  Update: WorkflowExecutionUpdateAcceptedEvent;
};

const getInitialEvent = (
  event: CommonHistoryEvent,
  events?: CommonHistoryEvent[],
) => {
  if (events?.length && isWorkflowExecutionUpdateAcceptedEvent(event)) {
    return events.find(
      (e) =>
        e.id ===
        event.workflowExecutionUpdateAcceptedEventAttributes?.acceptedRequestSequencingEventId.toString(),
    );
  }
  return event;
};

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K],
  events?: CommonHistoryEvent[],
): EventGroup => {
  const id = getGroupId(event);
  const name = getEventGroupName(event);
  const { timestamp, category, classification } = event;

  const initialEvent = getInitialEvent(event, events);

  const groupEvents: EventGroup['events'] = new Map();
  const groupEventIds: EventGroup['eventIds'] = new Set();

  if (initialEvent && isWorkflowExecutionUpdateAcceptedEvent(event)) {
    groupEvents.set(initialEvent.id, initialEvent);
    groupEvents.set(event.id, event);
    groupEventIds.add(initialEvent.id);
    groupEventIds.add(event.id);
  } else {
    groupEvents.set(event.id, event);
    groupEventIds.add(event.id);
  }

  return {
    id,
    name,
    events: groupEvents,
    eventIds: groupEventIds,
    initialEvent,
    timestamp,
    category,
    classification,
    get eventTime() {
      return this.lastEvent?.eventTime;
    },
    get attributes() {
      return getLastEvent(this)?.attributes;
    },
    get eventList() {
      return Array.from(this.events, ([_key, value]) => value);
    },
    get lastEvent() {
      return getLastEvent(this);
    },
    get isFailureOrTimedOut() {
      return Boolean(this.eventList.find(eventIsFailureOrTimedOut));
    },
    get isCanceled() {
      return Boolean(this.eventList.find(eventIsCanceled));
    },
    get isTerminated() {
      return Boolean(this.eventList.find(eventIsTerminated));
    },
  };
};

export const createEventGroup = (
  event: CommonHistoryEvent,
  events?: CommonHistoryEvent[],
): EventGroup => {
  if (isActivityTaskScheduledEvent(event))
    return createGroupFor<'Activity'>(event);

  if (isStartChildWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'ChildWorkflow'>(event);

  if (isTimerStartedEvent(event)) return createGroupFor<'Timer'>(event);

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'Signal'>(event);

  if (isWorkflowExecutionSignaledEvent(event))
    return createGroupFor<'SignalReceived'>(event);

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return createGroupFor<'LocalActivity'>(event);
    }
    return createGroupFor<'Marker'>(event);
  }

  if (isWorkflowExecutionUpdateAcceptedEvent(event))
    return createGroupFor<'Update'>(event, events);
};
