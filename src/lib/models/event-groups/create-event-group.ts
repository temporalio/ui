import type { Payload } from '$lib/types';
import type { CommonHistoryEvent, WorkflowEvent } from '$lib/types/events';
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

/**
 * A group's category, which is its head event's except for local-activity
 * markers. Shared with the buffer's LazyGroup so both derive it identically —
 * views filter on one and render the other.
 */
export const groupCategory = (
  head: WorkflowEvent,
): WorkflowEvent['category'] =>
  isLocalActivityMarkerEvent(head) ? 'local-activity' : head.category;

/**
 * Whether a group is still open. Depends only on its head event, how many of
 * its events have loaded, and any pending metadata — so the buffer can answer
 * it from a LazyGroup without building the group. Shared for the same reason
 * as groupCategory.
 */
export const groupIsPending = (
  head: WorkflowEvent,
  eventCount: number,
  pendingActivity: EventGroup['pendingActivity'],
  pendingNexusOperation: EventGroup['pendingNexusOperation'],
): boolean =>
  !!pendingActivity ||
  !!pendingNexusOperation ||
  (isTimerStartedEvent(head) && eventCount === 1) ||
  (isStartChildWorkflowExecutionInitiatedEvent(head) && eventCount === 2);

// Computed fields live on a shared prototype (via `this`) rather than as
// per-instance getter closures, so every group has a single hidden class and
// property access in the timeline's hot loops stays monomorphic.
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
  get eventCount() {
    return this.eventList.length;
  },
  get finalClassification() {
    return this.eventList[this.eventList.length - 1].classification;
  },
  get isPending() {
    return groupIsPending(
      this.initialEvent,
      this.eventList.length,
      this.pendingActivity,
      this.pendingNexusOperation,
    );
  },
};

const createGroupFor = (
  event: CommonHistoryEvent & { userMetadata?: { summary: Payload } },
): EventGroup => {
  const id = getGroupId(event);
  const name = getEventGroupName(event);
  const label = getEventGroupLabel(event);
  const displayName = getEventGroupDisplayName(event);
  const { timestamp, classification } = event;

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
    category: groupCategory(event),
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

/**
 * Whether `event` starts a group, including the WorkflowTask groups that
 * createWorkflowTaskGroup builds. Single source of truth for the dispatch, so
 * callers that only need to know whether a group exists — the buffer, deciding
 * which records to expose — can ask without building one.
 */
export const isGroupHeadEvent = (event: CommonHistoryEvent): boolean =>
  isWorkflowTaskScheduledEvent(event) ||
  isActivityTaskScheduledEvent(event) ||
  isStartChildWorkflowExecutionInitiatedEvent(event) ||
  isTimerStartedEvent(event) ||
  isSignalExternalWorkflowExecutionInitiatedEvent(event) ||
  isWorkflowExecutionSignaledEvent(event) ||
  isMarkerRecordedEvent(event) ||
  isWorkflowExecutionUpdateAcceptedEvent(event) ||
  isNexusOperationScheduledEvent(event);

export const createEventGroup = (
  event: CommonHistoryEvent,
): EventGroup | undefined => {
  // WorkflowTask heads are createWorkflowTaskGroup's, kept separate so callers
  // can exclude them.
  if (isWorkflowTaskScheduledEvent(event)) return undefined;
  if (!isGroupHeadEvent(event)) return undefined;
  // createGroupFor derives every field from the event, including the
  // local-activity category split, so the per-type branches only ever differed
  // in their type parameter.
  return createGroupFor(event);
};

export const createWorkflowTaskGroup = (
  event: CommonHistoryEvent,
): EventGroup | undefined => {
  if (isWorkflowTaskScheduledEvent(event)) return createGroupFor(event);
};
