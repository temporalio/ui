import type {
  ActivityTaskScheduledEvent,
  CommonHistoryEvent,
  MarkerRecordedEvent,
  SignalExternalWorkflowExecutionInitiatedEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  TimerStartedEvent,
  WorkflowExecutionSignaledEvent,
} from '$lib/types/events';
import {
  isActivityTaskScheduledEvent,
  isLocalActivityMarkerEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isWorkflowExecutionSignaledEvent,
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
};

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K],
): EventGroup => {
  const id = getGroupId(event);
  const name = getEventGroupName(event);
  const { timestamp, category, classification } = event;

  const initialEvent = event;

  const events: EventGroup['events'] = new Map();
  const eventIds: EventGroup['eventIds'] = new Set();

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

export const createEventGroup = (event: CommonHistoryEvent): EventGroup => {
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
};
