import {
  addEventToGroup,
  createEventGroup,
  createWorkflowTaskGroup,
} from '$lib/models/event-groups/create-event-group';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { getGroupId } from '$lib/models/event-groups/get-group-id';
import { toEvent } from '$lib/models/event-history';
import type {
  CommonHistoryEvent,
  HistoryEvent,
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
} from '$lib/types/events';
import { isWorkflowTaskFailedEventDueToReset } from '$lib/utilities/get-workflow-task-failed-event';
import {
  isActivityTaskCanceledEvent,
  isActivityTaskCompletedEvent,
  isActivityTaskFailedEvent,
  isActivityTaskScheduledEvent,
  isActivityTaskTimedOutEvent,
  isNexusOperationCanceledEvent,
  isNexusOperationCompletedEvent,
  isNexusOperationFailedEvent,
  isNexusOperationScheduledEvent,
  isNexusOperationTimedOutEvent,
} from '$lib/utilities/is-event-type';

export type GetGroupArrayOptions = {
  excludeWorkflowTasks?: boolean;
};

// Module state, cleared between workflows by reset(). Both bidirectional fetch
// cursors and the live poll feed through one ingest() into a single store — no
// live/pool split and no preallocated slots; the Maps grow as events arrive.

// Keyed by head event id; a group is visible only once its head has arrived.
const groupsById = new Map<string, EventGroup>();

// Followers (Started/Completed/…) seen before their head, flushed in when it arrives.
const parkedFollowers = new Map<string, WorkflowEvent[]>();

// One dedup set spanning both cursors and the live poll (drops fetch/poll overlap).
const seenIds = new Set<string>();

// Non-head events (WorkflowExecutionStarted/Completed/…): excluded from groups,
// included in getEventArray().
const soloEvents: WorkflowEvent[] = [];
const soloEventIds = new Set<string>();

// Marker billable-action dedup, accumulated by the ascending cursor only.
const processedWorkflowTaskIds = new Set<string>();

// getGroupArray() cache (both variants); nulled on any mutation.
let cachedGroups: EventGroup[] | null = null;
let cachedGroupsNoWFT: EventGroup[] | null = null;

function toWorkflowEvent(
  raw: HistoryEvent,
  isAscending: boolean,
): WorkflowEvent {
  return toEvent(raw, {
    processedWorkflowTaskIds: isAscending
      ? processedWorkflowTaskIds
      : undefined,
  });
}

// Insertion sort by event id: the descending cursor can deliver a follower
// before earlier events, and grouping/detail code expects eventList in id order.
function insertEventById(list: WorkflowEvent[], event: WorkflowEvent): void {
  const id = Number(event.id);
  let i = list.length;
  while (i > 0 && Number(list[i - 1].id) > id) i--;
  list.splice(i, 0, event);
}

function invalidateCache(): void {
  cachedGroups = null;
  cachedGroupsNoWFT = null;
}

function isWorkflowTaskGroup(group: EventGroup): boolean {
  return group.initialEvent.eventType === 'WorkflowTaskScheduled';
}

function hasTerminalActivityEvent(group: EventGroup): boolean {
  return group.eventList.some(
    (event) =>
      isActivityTaskCompletedEvent(event) ||
      isActivityTaskFailedEvent(event) ||
      isActivityTaskCanceledEvent(event) ||
      isActivityTaskTimedOutEvent(event),
  );
}

function hasTerminalNexusEvent(group: EventGroup): boolean {
  return group.eventList.some(
    (event) =>
      isNexusOperationCompletedEvent(event) ||
      isNexusOperationFailedEvent(event) ||
      isNexusOperationCanceledEvent(event) ||
      isNexusOperationTimedOutEvent(event),
  );
}

function clearResolvedPendingState(group: EventGroup): void {
  if (group.pendingActivity && hasTerminalActivityEvent(group)) {
    delete group.pendingActivity;
  }
  if (group.pendingNexusOperation && hasTerminalNexusEvent(group)) {
    delete group.pendingNexusOperation;
  }
}

// Clone preserving accessor descriptors (isPending, lastEvent, …) and sharing
// the eventList array. Gives reference-tracking Svelte consumers a fresh object
// when pending metadata changes without a new event (e.g. an activity is paused);
// mutating in place leaves the reference stable and they never re-derive.
function cloneGroup(group: EventGroup): EventGroup {
  return Object.create(
    Object.getPrototypeOf(group) as object,
    Object.getOwnPropertyDescriptors(group),
  ) as EventGroup;
}

function addFollowerToGroup(group: EventGroup, event: WorkflowEvent): void {
  insertEventById(group.eventList, event);
  group.timestamp = event.timestamp;
  addEventToGroup(group, event);
  clearResolvedPendingState(group);
}

// Single ingestion path for both the fetch cursors and the live poll. Returns
// whether the event was new, plus the group when it registered a new head.
function ingest(
  raw: HistoryEvent,
  isAscending: boolean,
): { isNew: boolean; head: EventGroup | null } {
  if (seenIds.has(raw.eventId)) return { isNew: false, head: null };
  seenIds.add(raw.eventId);

  const event = toWorkflowEvent(raw, isAscending);
  const gid = getGroupId(event as CommonHistoryEvent);

  if (gid !== event.id) {
    // Follower: attach to its head if present, otherwise park until it arrives.
    const group = groupsById.get(gid);
    if (group) {
      addFollowerToGroup(group, event);
    } else {
      const parked = parkedFollowers.get(gid);
      if (parked) parked.push(event);
      else parkedFollowers.set(gid, [event]);
    }
    invalidateCache();
    return { isNew: true, head: null };
  }

  // Head event.
  const group =
    createEventGroup(event as CommonHistoryEvent) ??
    createWorkflowTaskGroup(event as CommonHistoryEvent);

  if (!group) {
    // Solo event (e.g. WorkflowExecutionStarted) — not a group head.
    if (!soloEventIds.has(event.id)) {
      soloEvents.push(event);
      soloEventIds.add(event.id);
    }
    invalidateCache();
    return { isNew: true, head: null };
  }

  groupsById.set(gid, group);

  // Flush any followers that arrived before this head.
  const parked = parkedFollowers.get(gid);
  if (parked) {
    for (const follower of parked) addFollowerToGroup(group, follower);
    parkedFollowers.delete(gid);
  }

  invalidateCache();
  return { isNew: true, head: group };
}

function enrichGroup(
  group: EventGroup,
  byActivityId: Map<string, PendingActivity>,
  byNexusScheduledId: Map<string, PendingNexusOperation>,
): EventGroup {
  const initial = group.initialEvent;

  if (isActivityTaskScheduledEvent(initial)) {
    const pa = byActivityId.get(
      initial.activityTaskScheduledEventAttributes?.activityId ?? '',
    );
    const next = pa && !hasTerminalActivityEvent(group) ? pa : undefined;
    if (group.pendingActivity === next) return group;
    const enriched = cloneGroup(group);
    enriched.pendingActivity = next;
    return enriched;
  }

  if (isNexusOperationScheduledEvent(initial)) {
    const pn = byNexusScheduledId.get(group.id);
    const next = pn && !hasTerminalNexusEvent(group) ? pn : undefined;
    if (group.pendingNexusOperation === next) return group;
    const enriched = cloneGroup(group);
    enriched.pendingNexusOperation = next;
    return enriched;
  }

  return group;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Clear all state; call before starting a new workflow fetch. */
export function reset(_historyLength?: number): void {
  groupsById.clear();
  parkedFollowers.clear();
  seenIds.clear();
  soloEvents.length = 0;
  soloEventIds.clear();
  processedWorkflowTaskIds.clear();
  invalidateCache();
}

/**
 * Ingest one raw event from a bidirectional cursor (isAscending picks the
 * cursor). Returns the group when this event is a new head, else null.
 */
export function processEvent(
  raw: HistoryEvent,
  isAscending: boolean,
): EventGroup | null {
  return ingest(raw, isAscending).head;
}

/** Append one event from the live poll. Returns false if it was a duplicate. */
export function appendLiveEvent(raw: HistoryEvent): boolean {
  return ingest(raw, true).isNew;
}

/**
 * Annotate activity/nexus groups with pending metadata from the workflow run.
 * Swaps in a fresh group reference when pending state changes so
 * reference-tracking consumers re-derive.
 */
export function enrichGroups(
  pendingActivities: PendingActivity[],
  pendingNexusOperations: PendingNexusOperation[],
): void {
  const byActivityId = new Map(pendingActivities.map((p) => [p.activityId, p]));
  const byNexusScheduledId = new Map(
    pendingNexusOperations.map((p) => [String(p.scheduledEventId), p]),
  );

  for (const [id, group] of groupsById) {
    groupsById.set(id, enrichGroup(group, byActivityId, byNexusScheduledId));
  }
  invalidateCache();
}

/** Groups sorted by ascending head event id; cached until the next mutation. */
export function getGroupArray(opts?: GetGroupArrayOptions): EventGroup[] {
  const excludeWFT = Boolean(opts?.excludeWorkflowTasks);
  const cached = excludeWFT ? cachedGroupsNoWFT : cachedGroups;
  if (cached !== null) return cached;

  const result: EventGroup[] = [];
  for (const group of groupsById.values()) {
    if (excludeWFT && isWorkflowTaskGroup(group)) continue;
    result.push(group);
  }
  result.sort((a, b) => Number(a.id) - Number(b.id));

  if (excludeWFT) cachedGroupsNoWFT = result;
  else cachedGroups = result;
  return result;
}

/** All events (group members + solo) flattened in ascending id order. */
export function getEventArray(): WorkflowEvent[] {
  const result: WorkflowEvent[] = [];
  for (const group of groupsById.values()) {
    for (const event of group.eventList) result.push(event);
  }
  for (const event of soloEvents) result.push(event);
  result.sort((a, b) => Number(a.id) - Number(b.id));
  return result;
}

/**
 * The active WorkflowTaskFailed/TimedOut event — one with no later
 * WorkflowTaskCompleted — or undefined if the workflow task isn't failing.
 */
export function getWorkflowTaskFailedEvent(): WorkflowEvent | undefined {
  let lastFailedEvent: WorkflowEvent | undefined;
  let maxCompletedId = -1;

  for (const group of groupsById.values()) {
    if (!isWorkflowTaskGroup(group)) continue;
    for (const event of group.eventList) {
      if (event.eventType === 'WorkflowTaskCompleted') {
        const id = Number(event.id);
        if (id > maxCompletedId) maxCompletedId = id;
      }
      if (
        (event.eventType === 'WorkflowTaskFailed' ||
          event.eventType === 'WorkflowTaskTimedOut') &&
        !isWorkflowTaskFailedEventDueToReset(event)
      ) {
        if (!lastFailedEvent || Number(event.id) > Number(lastFailedEvent.id)) {
          lastFailedEvent = event;
        }
      }
    }
  }

  if (!lastFailedEvent) return undefined;
  if (Number(lastFailedEvent.id) < maxCompletedId) return undefined;
  return lastFailedEvent;
}
