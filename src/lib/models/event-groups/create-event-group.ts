import type {
  ActivityTaskScheduledEvent,
  CommonHistoryEvent,
  MarkerRecordedEvent,
  NexusOperationScheduledEvent,
  SignalExternalWorkflowExecutionInitiatedEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  TimerStartedEvent,
  WorkflowExecutionSignaledEvent,
  WorkflowExecutionUpdateAcceptedEvent,
  WorkflowTaskScheduledEvent,
} from '$lib/types/events';
import {
  isActivityTaskScheduledEvent,
  isLocalActivityMarkerEvent,
  isMarkerRecordedEvent,
  isNexusOperationScheduledEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
  isWorkflowTaskScheduledEvent,
} from '$lib/utilities/is-event-type';

import type { EventGroup } from './event-groups';
import {
  eventIsCanceled,
  eventIsFailureOrTimedOut,
  eventIsTerminated,
} from './get-event-in-group';
import { getGroupId } from './get-group-id';
import {
  getEventGroupDisplayName,
  getEventGroupLabel,
  getEventGroupName,
} from './get-group-name';
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
  WorkflowTask: WorkflowTaskScheduledEvent;
  Nexus: NexusOperationScheduledEvent;
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
  const label = getEventGroupLabel(event);
  const displayName = getEventGroupDisplayName(event);

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
    label,
    displayName,
    events: groupEvents,
    eventIds: groupEventIds,
    initialEvent,
    timestamp,
    category: isLocalActivityMarkerEvent(event) ? 'local-activity' : category,
    classification,
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
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
    get finalClassification() {
      return getLastEvent(this).classification;
    },
    get isPending() {
      return (
        !!this.pendingActivity ||
        !!this.pendingNexusOperation ||
        (isTimerStartedEvent(this.initialEvent) &&
          this.eventList.length === 1) ||
        (isStartChildWorkflowExecutionInitiatedEvent(this.initialEvent) &&
          this.eventList.length === 2)
      );
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

  if (isNexusOperationScheduledEvent(event))
    return createGroupFor<'Nexus'>(event, events);
};

export const createWorkflowTaskGroup = (
  event: CommonHistoryEvent,
  events?: CommonHistoryEvent[],
): EventGroup => {
  if (isWorkflowTaskScheduledEvent(event))
    return createGroupFor<'WorkflowTask'>(event, events);
};
