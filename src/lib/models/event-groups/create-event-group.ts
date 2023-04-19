import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isLocalActivityMarkerEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isTimerStartedEvent,
  isWorkflowTaskScheduledEvent,
  isUpsertWorkflowSearchAttributesEvent,
  isWorkflowExecutionCancelRequestedEvent,
  isWorkflowExecutionTerminatedEvent,
  isWorkflowExecutionTimedOutEvent,
} from '$lib/utilities/is-event-type';
import {
  eventIsFailureOrTimedOut,
  eventIsCanceled,
  eventIsTerminated,
  eventIsCompleted,
} from './get-event-in-group';

import { getGroupId } from './get-group-id';
import { getEventGroupName } from './get-group-name';
import { getLastEvent } from './get-last-event';
import type {
  ActivityTaskScheduledEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  TimerStartedEvent,
  SignalExternalWorkflowExecutionInitiatedEvent,
  WorkflowExecutionSignaledEvent,
  MarkerRecordedEvent,
  CommonHistoryEvent,
} from '$lib/types/events';
import type { EventGroup } from './event-groups';

type StartingEvents = {
  Activity: ActivityTaskScheduledEvent;
  ChildWorkflow: StartChildWorkflowExecutionInitiatedEvent;
  Timer: TimerStartedEvent;
  Signal: SignalExternalWorkflowExecutionInitiatedEvent;
  SignalReceived: WorkflowExecutionSignaledEvent;
  LocalActivity: MarkerRecordedEvent;
  Marker: MarkerRecordedEvent;
  WorkflowTask: WorkflowTaskScheduledEvent;
  SearchAttribute: UpsertWorkflowSearchAttributesEvent;
  CancelRequested: WorkflowExecutionCancelRequestedEvent;
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
    subGroups: new Map(),
    get eventTime() {
      return this.lastEvent?.eventTime;
    },
    get attributes() {
      return getLastEvent(this)?.attributes;
    },
    get eventList() {
      return Array.from(this.events, ([_key, value]) => value);
    },
    get subGroupList() {
      return Array.from(this.subGroups, ([_key, value]) => value);
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
    get isCompleted() {
      return Boolean(this.eventList.find(eventIsCompleted));
    },
  };
};

export const createEventGroup = (
  event: CommonHistoryEvent,
  createWorkflowTaskGroups = false,
): EventGroup => {
  if (isStartChildWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'ChildWorkflow'>(event);

  if (isWorkflowExecutionSignaledEvent(event))
    return createGroupFor<'SignalReceived'>(event);

  if (isWorkflowTaskScheduledEvent(event) && createWorkflowTaskGroups) {
    return createGroupFor<'WorkflowTask'>(event);
  }

  if (
    isUpsertWorkflowSearchAttributesEvent(event) &&
    createWorkflowTaskGroups
  ) {
    return createGroupFor<'SearchAttribute'>(event);
  }

  if (isActivityTaskScheduledEvent(event)) {
    return createGroupFor<'Activity'>(event);
  }

  if (
    isWorkflowExecutionCancelRequestedEvent(event) &&
    createWorkflowTaskGroups
  ) {
    return createGroupFor<'CancelRequested'>(event);
  }

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return createGroupFor<'LocalActivity'>(event);
    } else if (createWorkflowTaskGroups) {
      return createGroupFor<'Marker'>(event);
    }
  }

  if (isTimerStartedEvent(event)) return createGroupFor<'Timer'>(event);

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'Signal'>(event);
};
