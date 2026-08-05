import {
  addEventToGroup,
  createEventGroup,
  createWorkflowTaskGroup,
  isGroupHeadEvent,
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
  isLocalActivityMarkerEvent,
  isNexusOperationCanceledEvent,
  isNexusOperationCompletedEvent,
  isNexusOperationFailedEvent,
  isNexusOperationScheduledEvent,
  isNexusOperationTimedOutEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isWorkflowTaskScheduledEvent,
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

/**
 * The read surface of a group that needs no EventGroup. Filtering, sorting and
 * time-segment layout run over these, so a view only materializes the groups it
 * actually renders — a fixed row pool, or one page of the compact table.
 */
export interface LazyGroup {
  readonly id: string;
  /**
   * Bumped whenever the group's content changes. A lazy group's own identity is
   * stable for the life of the run, so consumers that cache per group — the
   * timeline's row pool — must compare this too, not just the reference.
   * Absent on groups built outside the buffer, which never change.
   */
  readonly version?: number;
  readonly eventCount: number;
  readonly initialEvent: WorkflowEvent;
  readonly lastEvent: WorkflowEvent;
  readonly category: WorkflowEvent['category'];
  readonly classification: WorkflowEvent['classification'];
  readonly finalClassification: WorkflowEvent['classification'];
  readonly isPending: boolean;
  readonly pendingActivity: PendingActivity | undefined;
  readonly pendingNexusOperation: PendingNexusOperation | undefined;
}

/**
 * Distinguishes a lazy group from an already-materialized EventGroup or a plain
 * event, for views handed a mix of the two.
 */
export function isLazyGroup(value: unknown): value is LazyGroup {
  return (
    typeof value === 'object' &&
    value !== null &&
    'eventCount' in value &&
    !('eventList' in value)
  );
}

/**
 * One per group for the lifetime of the run. Holds the member slots rather than
 * the events, and derives LazyGroup from them on demand — every getter is a
 * lookup into `events`, so lazy groups cost no allocation.
 *
 * INVARIANT: each getter must agree with the same field on the materialized
 * EventGroup, or a view will filter on one and render the other. Guarded by
 * grouped-event-buffer.test.ts.
 */
class GroupRecord implements LazyGroup {
  // Member slots in arrival order — sorted at materialize time. Groups hold 1-5
  // events, so linear scans over this are cheaper than keeping it ordered.
  readonly slots: number[] = [];
  pendingActivity: PendingActivity | undefined;
  pendingNexusOperation: PendingNexusOperation | undefined;
  version = 0;
  cached: EventGroup | null = null;
  cachedVersion = -1;

  constructor(readonly headSlot: number) {}

  get id(): string {
    return String(this.headSlot + 1);
  }

  get eventCount(): number {
    return this.slots.length;
  }

  get initialEvent(): WorkflowEvent {
    return events[this.headSlot] as WorkflowEvent;
  }

  get lastEvent(): WorkflowEvent {
    let latest = -1;
    for (const slot of this.slots) {
      if (slot > latest) latest = slot;
    }
    return events[latest] as WorkflowEvent;
  }

  get category(): WorkflowEvent['category'] {
    const head = this.initialEvent;
    return isLocalActivityMarkerEvent(head) ? 'local-activity' : head.category;
  }

  get classification(): WorkflowEvent['classification'] {
    return this.initialEvent.classification;
  }

  get finalClassification(): WorkflowEvent['classification'] {
    return this.lastEvent.classification;
  }

  get isPending(): boolean {
    if (this.pendingActivity || this.pendingNexusOperation) return true;
    const head = this.initialEvent;
    if (isTimerStartedEvent(head)) return this.slots.length === 1;
    if (isStartChildWorkflowExecutionInitiatedEvent(head)) {
      return this.slots.length === 2;
    }
    return false;
  }
}

export type ChangeListener = (immediate: boolean) => void;

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
let cachedLazyGroups: LazyGroup[] | null = null;
let cachedLazyGroupsRevision = -1;
let cachedLazyGroupsNoWFT: LazyGroup[] | null = null;
let cachedLazyGroupsNoWFTRevision = -1;

const changeListeners = new Set<ChangeListener>();

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function notifyChanged(immediate = false): void {
  for (const listener of changeListeners) listener(immediate);
}

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

  const record = new GroupRecord(headSlot);
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
  cachedLazyGroups = null;
  cachedLazyGroupsNoWFT = null;

  notifyChanged(true);
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

  notifyChanged();
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

  let changed = false;

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
    changed = true;
  }

  if (changed) notifyChanged();
}

/**
 * Subscribe to buffer writes. Fires once per ingested event and once per
 * pending-metadata change, so subscribers are expected to coalesce. `immediate`
 * is true for reset, which subscribers should apply without coalescing so a
 * navigation cannot leave the previous run's groups on screen.
 * Returns an unsubscribe function.
 */
export function onChange(listener: ChangeListener): () => void {
  changeListeners.add(listener);
  return () => changeListeners.delete(listener);
}

export function isWorkflowTaskGroup(group: EventGroup | LazyGroup): boolean {
  return group.initialEvent.eventType === 'WorkflowTaskScheduled';
}

/**
 * Sorted LazyGroup[] in ascending event-id order, without building a single
 * EventGroup. Cached until the next write; lazy groups are the records themselves,
 * so a rebuild allocates only the array.
 */
export function getLazyGroups(opts?: GroupArrayOptions): LazyGroup[] {
  const excludeWFT = Boolean(opts?.excludeWorkflowTasks);

  if (excludeWFT) {
    if (cachedLazyGroupsNoWFT && cachedLazyGroupsNoWFTRevision === revision) {
      return cachedLazyGroupsNoWFT;
    }
  } else if (cachedLazyGroups && cachedLazyGroupsRevision === revision) {
    return cachedLazyGroups;
  }

  // headGroup is indexed by head slot, so scanning it yields groups already in
  // ascending event-id order — no sort needed.
  const result: LazyGroup[] = new Array<LazyGroup>(records.length);
  let count = 0;
  for (let slot = 0; slot <= maxSlot; slot++) {
    const recordIdx = headGroup[slot];
    if (recordIdx === 0) continue;
    const record = records[recordIdx - 1];
    const head = events[record.headSlot];
    if (!head) continue;
    if (
      !isGroupHeadEvent(head as CommonHistoryEvent) &&
      !isWorkflowTaskScheduledEvent(head)
    ) {
      continue;
    }
    if (excludeWFT && isWorkflowTaskGroup(record)) continue;
    result[count++] = record;
  }
  result.length = count;

  if (excludeWFT) {
    cachedLazyGroupsNoWFT = result;
    cachedLazyGroupsNoWFTRevision = revision;
  } else {
    cachedLazyGroups = result;
    cachedLazyGroupsRevision = revision;
  }
  return result;
}

/**
 * The full EventGroup for a lazy group, memoized on its content version: an
 * unchanged lazy group returns the identical object, a changed one a new object.
 *
 * Idempotent — an already-materialized EventGroup passes straight through, so
 * views can accept either lazy groups or groups built elsewhere (e.g.
 * groupEvents() in graph-widget) without branching at every use site.
 */
export function materializeGroup(lazy: LazyGroup): EventGroup {
  if ('eventList' in lazy) return lazy as unknown as EventGroup;

  const record = lazy as GroupRecord;
  if (record.cachedVersion === record.version && record.cached) {
    return record.cached;
  }
  return materializeEventGroup(record) as EventGroup;
}

/**
 * Sorted EventGroup[] in ascending event-id order — materializes every group.
 * Prefer getLazyGroups + materializeGroup so only rendered groups are built.
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

  const result = getLazyGroups(opts).map(materializeGroup);

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
