import type { Payload } from '$lib/types';
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

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K] & { userMetadata?: { summary: Payload } },
): EventGroup => {
  const id = getGroupId(event);
  const name = getEventGroupName(event);
  const label = getEventGroupLabel(event);
  const displayName = getEventGroupDisplayName(event);

  const { timestamp, category, classification } = event;

  const groupEvents: EventGroup['events'] = new Map();
  const groupEventIds: EventGroup['eventIds'] = new Set();

  groupEvents.set(event.id, event);
  groupEventIds.add(event.id);

  return {
    id,
    name,
    label,
    displayName,
    events: groupEvents,
    eventIds: groupEventIds,
    initialEvent: event,
    timestamp,
    category: isLocalActivityMarkerEvent(event) ? 'local-activity' : category,
    classification,
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    userMetadata: event?.userMetadata,
    get eventTime() {
      return this.lastEvent?.eventTime;
    },
    get attributes() {
      return getLastEvent(this)?.attributes;
    },
    get eventList() {
      return Array.from(this.events, ([_key, value]) => value);
    },
    get links() {
      return Array.from(this.events, ([_key, value]) => value.links).flat();
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

  if (isWorkflowExecutionUpdateAcceptedEvent(event))
    return createGroupFor<'Update'>(event);

  if (isNexusOperationScheduledEvent(event))
    return createGroupFor<'Nexus'>(event);
};

export const createWorkflowTaskGroup = (
  event: CommonHistoryEvent,
): EventGroup => {
  if (isWorkflowTaskScheduledEvent(event))
    return createGroupFor<'WorkflowTask'>(event);
};
