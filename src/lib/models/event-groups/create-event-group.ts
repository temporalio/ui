import type { EventLink, Payload } from '$lib/types';
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

  // PERF CRITICAL: eventList and links were the #1 source of GC pressure on the
  // 40k-event timeline — a CPU trace showed 19s of GC time caused by these two
  // getters. Each call previously did Array.from(this.events, ...) allocating a
  // brand-new array. They are called from at least 6 places per render
  // (getDistancePointsAndPositions, isPending, isFailureOrTimedOut, isCanceled,
  // isTerminated, billableActions), multiplied across ~10k groups = ~60k short-
  // lived arrays per frame continuously feeding the major GC.
  //
  // Fix: cache behind events.size. This is safe because events are append-only
  // (Map.set is the only mutation, never Map.delete), so size increasing is a
  // reliable signal that the cached array is stale.
  let _eventList: EventGroup['eventList'] | undefined;
  let _eventListSize = 0;
  let _links: EventLink[] | undefined;
  let _linksSize = 0;

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
      if (!_eventList || this.events.size !== _eventListSize) {
        _eventList = Array.from(this.events, ([_key, value]) => value);
        _eventListSize = this.events.size;
      }
      return _eventList;
    },
    get links() {
      if (!_links || this.events.size !== _linksSize) {
        _links = Array.from(this.events, ([_key, value]) => value.links).flat();
        _linksSize = this.events.size;
      }
      return _links;
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
    get billableActions() {
      return this.eventList.reduce(
        (acc, event) => event.billableActions + acc,
        0,
      );
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
