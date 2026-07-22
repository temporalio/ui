import type { EventLink, Payload } from '$lib/types';
import type {
  ActivityTaskScheduledEvent,
  CommonHistoryEvent,
  MarkerRecordedEvent,
  NexusOperationScheduledEvent,
  SignalExternalWorkflowExecutionInitiatedEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  TimerStartedEvent,
  WorkflowEvent,
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

// Computed fields live on a shared prototype (via `this`) rather than as
// per-instance getter closures. Every group then has a single hidden class, so
// property access in the timeline's hot loops stays monomorphic, and
// cloneEventGroup() can shallow-copy the data fields without re-declaring the
// accessors or invoking them.
const eventGroupProto: ThisType<EventGroup> = {
  get eventTime() {
    return this.eventList[this.eventList.length - 1]?.eventTime;
  },
  get attributes() {
    return this.eventList[this.eventList.length - 1]?.attributes;
  },
  get lastEvent() {
    return this.eventList[this.eventList.length - 1];
  },
  get finalClassification() {
    return this.eventList[this.eventList.length - 1].classification;
  },
  get isPending() {
    return (
      !!this.pendingActivity ||
      !!this.pendingNexusOperation ||
      (isTimerStartedEvent(this.initialEvent) && this.eventList.length === 1) ||
      (isStartChildWorkflowExecutionInitiatedEvent(this.initialEvent) &&
        this.eventList.length === 2)
    );
  },
};

/**
 * Shallow-clone a group onto the same prototype, sharing its eventList. Copies
 * only own data fields (the accessors live on the prototype, so they are
 * neither copied nor invoked), giving the clone an identical shape to
 * createGroupFor's groups and a fresh reference for reference-tracking Svelte
 * views to re-derive from.
 */
export const cloneEventGroup = (group: EventGroup): EventGroup =>
  Object.assign(
    Object.create(Object.getPrototypeOf(group) as object),
    group,
  ) as EventGroup;

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K] & { userMetadata?: { summary: Payload } },
): EventGroup => {
  const id = getGroupId(event);
  const name = getEventGroupName(event);
  const label = getEventGroupLabel(event);
  const displayName = getEventGroupDisplayName(event);
  const { timestamp, category, classification } = event;

  // Single flat array — no Map, no Set. Groups have 1–5 events.
  const eventList: EventGroup['eventList'] = [event as never];
  // eventList[0] is the same object as event, typed as WorkflowEvent at runtime.
  const first = eventList[0];

  return Object.assign(Object.create(eventGroupProto) as EventGroup, {
    id,
    name,
    label,
    displayName,
    eventList,
    initialEvent: event,
    timestamp,
    category: isLocalActivityMarkerEvent(event) ? 'local-activity' : category,
    classification,
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    userMetadata: event?.userMetadata,
    // Eager fields — zero-cost reads, updated by addEventToGroup on each push.
    isFailureOrTimedOut: eventIsFailureOrTimedOut(first),
    isCanceled: eventIsCanceled(first),
    isTerminated: eventIsTerminated(first),
    billableActions: first.billableActions ?? 0,
    links: first.links ? [...first.links] : [],
  });
};

// Called by addToExistingGroup after pushing a new event into a group's eventList.
// Updates all eagerly-maintained fields in one place so getters stay zero-cost.
export const addEventToGroup = (group: EventGroup, event: WorkflowEvent) => {
  if (eventIsFailureOrTimedOut(event)) group.isFailureOrTimedOut = true;
  if (eventIsCanceled(event)) group.isCanceled = true;
  if (eventIsTerminated(event)) group.isTerminated = true;
  group.billableActions += event.billableActions ?? 0;
  if (event.links?.length) {
    for (const l of event.links) group.links.push(l);
  }
};

export const createEventGroup = (
  event: CommonHistoryEvent,
): EventGroup | undefined => {
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
): EventGroup | undefined => {
  if (isWorkflowTaskScheduledEvent(event))
    return createGroupFor<'WorkflowTask'>(event);
};
