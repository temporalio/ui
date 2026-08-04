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

/**
 * Event store for a single workflow run, shared by the history and timeline
 * views.
 *
 * Events are canonical; groups are derived. `ingestHistoryEvent` writes a
 * converted event into a flat slot array (slot = eventId - 1) and records its
 * slot on the GroupRecord for its head event — integer bookkeeping only.
 * EventGroup objects are built on read by `materializeEventGroup` and memoized
 * against the record's version.
 *
 * That inversion is what keeps reference-tracking Svelte views correct: a group
 * object's identity is a pure function of its content version, so an unchanged
 * group always reads back as the same reference (the timeline row pool keys on
 * identity) and a changed group always reads back as a new one. There is no
 * mutable published group to forget to replace.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GroupRecord = {
  headSlot: number;
  // Member slots in arrival order — sorted at materialize time. Groups hold 1-5
  // events, so linear scans over this are cheaper than keeping it ordered.
  slots: number[];
  pendingActivity: PendingActivity | undefined;
  pendingNexusOperation: PendingNexusOperation | undefined;
  version: number;
  cached: EventGroup | null;
  cachedVersion: number;
};

export type GroupArrayOptions = {
  excludeWorkflowTasks?: boolean;
};

// ---------------------------------------------------------------------------
// Module state (reset between workflows via reset())
// ---------------------------------------------------------------------------

let events: (WorkflowEvent | null)[] = [];
let headGroup = new Int32Array(0); // head slot -> record index + 1 (0 = none)
let records: GroupRecord[] = [];
let maxSlot = -1;

let failedEvent: HistoryEvent | null = null;

// Accumulated WFT IDs for marker billable-action dedup (ascending cursor only)
const processedWorkflowTaskIds = new Set<string>();

// Bumped by every write. Read caches hold the revision they were built at, so
// invalidation is a single counter rather than scattered cache-busting calls.
let revision = 0;

let cachedGroups: EventGroup[] | null = null;
let cachedGroupsRevision = -1;
let cachedGroupsNoWFT: EventGroup[] | null = null;
let cachedGroupsNoWFTRevision = -1;
let cachedEvents: WorkflowEvent[] | null = null;
let cachedEventsRevision = -1;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function grow(slot: number): void {
  if (slot < events.length) return;
  const size = slot + Math.ceil(slot * 0.25) + 16;
  events.length = size;
  const grown = new Int32Array(size);
  grown.set(headGroup);
  headGroup = grown;
}

function shouldNotAddBillableAction(event: WorkflowEvent): boolean {
  if (!failedEvent) return false;
  return Number(event.id) < Number(failedEvent.eventId);
}

function toWorkflowEvent(
  raw: HistoryEvent,
  isAscending: boolean,
): WorkflowEvent {
  return toEvent(raw, {
    shouldNotAddBillableAction,
    processedWorkflowTaskIds: isAscending
      ? processedWorkflowTaskIds
      : undefined,
  });
}

function recordFor(headSlot: number): GroupRecord {
  const existing = headGroup[headSlot];
  if (existing !== 0) return records[existing - 1];

  const record: GroupRecord = {
    headSlot,
    slots: [],
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    version: 0,
    cached: null,
    cachedVersion: -1,
  };
  records.push(record);
  headGroup[headSlot] = records.length;
  return record;
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

// Pending metadata is applied as a derived read rather than stored on the
// group, so a terminal event and a stale pending entry can arrive in either
// order without leaving the group reporting isPending alongside a completion.
function applyPendingMetadata(group: EventGroup, record: GroupRecord): void {
  if (record.pendingActivity && !hasTerminalActivityEvent(group)) {
    group.pendingActivity = record.pendingActivity;
  }
  if (record.pendingNexusOperation && !hasTerminalNexusEvent(group)) {
    group.pendingNexusOperation = record.pendingNexusOperation;
  }
}

/**
 * Build the EventGroup for a record, or null when it has no head event yet or
 * its head event doesn't form a group (e.g. WorkflowExecutionStarted).
 * Memoized on the record's version — callers may rely on an unchanged record
 * returning the identical object.
 */
function materializeEventGroup(record: GroupRecord): EventGroup | null {
  if (record.cachedVersion === record.version) return record.cached;
  record.cachedVersion = record.version;
  record.cached = null;

  const head = events[record.headSlot];
  if (!head) return null;

  const group =
    createEventGroup(head as CommonHistoryEvent) ??
    createWorkflowTaskGroup(head as CommonHistoryEvent);
  if (!group) return null;

  const followers: WorkflowEvent[] = [];
  for (const slot of record.slots) {
    if (slot === record.headSlot) continue;
    const event = events[slot];
    if (event) followers.push(event);
  }
  followers.sort((a, b) => Number(a.id) - Number(b.id));

  for (const event of followers) {
    group.eventList.push(event);
    group.timestamp = event.timestamp;
    addEventToGroup(group, event);
  }

  applyPendingMetadata(group, record);

  record.cached = group;
  return group;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * (Re)initialise the buffer for a new workflow run.
 * Call before starting the bidirectional fetch.
 */
export function reset(historyLength: number): void {
  const size = Math.max(historyLength + 16, 16);

  events = new Array<null>(size).fill(null);
  headGroup = new Int32Array(size);
  records = [];
  maxSlot = -1;

  failedEvent = null;
  processedWorkflowTaskIds.clear();

  revision++;
  cachedGroups = null;
  cachedGroupsNoWFT = null;
  cachedEvents = null;
}

/**
 * Call from the descending cursor's onFirstDescPage hook to capture the
 * failedEvent used for billableActions calculation.
 */
export function setFailedEvent(raw: HistoryEvent | null): void {
  failedEvent = raw;
}

/**
 * Add one raw HistoryEvent from either fetch cursor or the live poll.
 * isAscending selects the ascending cursor's workflow-task dedup context.
 * Returns false when the event was already present.
 */
export function ingestHistoryEvent(
  raw: HistoryEvent,
  isAscending: boolean,
): boolean {
  const slot = parseInt(raw.eventId) - 1;
  if (!(slot >= 0)) return false;

  grow(slot);
  if (events[slot]) return false;

  const event = toWorkflowEvent(raw, isAscending);
  events[slot] = event;
  if (slot > maxSlot) maxSlot = slot;

  // An event whose head is unknown (malformed attributes) heads its own group.
  const parsedHeadSlot = parseInt(getGroupId(event as CommonHistoryEvent)) - 1;
  const headSlot = parsedHeadSlot >= 0 ? parsedHeadSlot : slot;
  grow(headSlot);

  const record = recordFor(headSlot);
  record.slots.push(slot);
  record.version++;
  revision++;

  return true;
}

/**
 * Annotate activity and nexus groups with pending metadata from the workflow
 * run. Safe to call repeatedly — groups whose pending entry is unchanged keep
 * their existing reference.
 */
export function enrichGroups(
  pendingActivities: PendingActivity[],
  pendingNexusOperations: PendingNexusOperation[],
): void {
  const byActivityId = new Map(
    pendingActivities.map((pending) => [pending.activityId, pending]),
  );
  const byNexusScheduledId = new Map(
    pendingNexusOperations.map((pending) => [
      String(pending.scheduledEventId),
      pending,
    ]),
  );

  for (const record of records) {
    const head = events[record.headSlot];
    if (!head) continue;

    let pendingActivity: PendingActivity | undefined;
    let pendingNexusOperation: PendingNexusOperation | undefined;

    if (isActivityTaskScheduledEvent(head)) {
      pendingActivity = byActivityId.get(
        head.activityTaskScheduledEventAttributes?.activityId ?? '',
      );
    } else if (isNexusOperationScheduledEvent(head)) {
      pendingNexusOperation = byNexusScheduledId.get(head.id);
    }

    if (
      record.pendingActivity === pendingActivity &&
      record.pendingNexusOperation === pendingNexusOperation
    ) {
      continue;
    }

    record.pendingActivity = pendingActivity;
    record.pendingNexusOperation = pendingNexusOperation;
    record.version++;
    revision++;
  }
}

export function isWorkflowTaskGroup(group: EventGroup): boolean {
  return group.initialEvent.eventType === 'WorkflowTaskScheduled';
}

/**
 * Sorted EventGroup[] in ascending event-id order. Cached until the next write;
 * within a rebuild, groups that have not changed are returned by reference.
 */
export function getGroupArray(opts?: GroupArrayOptions): EventGroup[] {
  const excludeWFT = Boolean(opts?.excludeWorkflowTasks);

  if (excludeWFT) {
    if (cachedGroupsNoWFT && cachedGroupsNoWFTRevision === revision) {
      return cachedGroupsNoWFT;
    }
  } else if (cachedGroups && cachedGroupsRevision === revision) {
    return cachedGroups;
  }

  // headGroup is indexed by head slot, so scanning it yields groups already in
  // ascending event-id order — no sort needed.
  const result: EventGroup[] = new Array<EventGroup>(records.length);
  let count = 0;
  for (let slot = 0; slot <= maxSlot; slot++) {
    const recordIdx = headGroup[slot];
    if (recordIdx === 0) continue;
    const record = records[recordIdx - 1];
    const group =
      record.cachedVersion === record.version
        ? record.cached
        : materializeEventGroup(record);
    if (!group) continue;
    if (excludeWFT && isWorkflowTaskGroup(group)) continue;
    result[count++] = group;
  }
  result.length = count;

  if (excludeWFT) {
    cachedGroupsNoWFT = result;
    cachedGroupsNoWFTRevision = revision;
  } else {
    cachedGroups = result;
    cachedGroupsRevision = revision;
  }
  return result;
}

/** Flat WorkflowEvent[] in ascending event-id order. */
export function getEventArray(): WorkflowEvent[] {
  if (cachedEvents && cachedEventsRevision === revision) return cachedEvents;

  const result: WorkflowEvent[] = [];
  for (let slot = 0; slot <= maxSlot; slot++) {
    const event = events[slot];
    if (event) result.push(event);
  }

  cachedEvents = result;
  cachedEventsRevision = revision;
  return result;
}

/**
 * The WorkflowTaskFailed/TimedOut event that is currently active (i.e. has no
 * subsequent WorkflowTaskCompleted), or undefined if none.
 */
export function getWorkflowTaskFailedEvent(): WorkflowEvent | undefined {
  let lastFailedEvent: WorkflowEvent | undefined;
  let maxCompletedId = -1;

  for (let slot = 0; slot <= maxSlot; slot++) {
    const event = events[slot];
    if (!event) continue;

    if (event.eventType === 'WorkflowTaskCompleted') {
      const id = Number(event.id);
      if (id > maxCompletedId) maxCompletedId = id;
      continue;
    }

    if (
      (event.eventType === 'WorkflowTaskFailed' ||
        event.eventType === 'WorkflowTaskTimedOut') &&
      !isWorkflowTaskFailedEventDueToReset(event)
    ) {
      lastFailedEvent = event;
    }
  }

  if (!lastFailedEvent) return undefined;
  if (Number(lastFailedEvent.id) < maxCompletedId) return undefined;
  return lastFailedEvent;
}
