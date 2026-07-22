import {
  addEventToGroup,
  cloneEventGroup,
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GroupMeta = {
  headSlotIdx: number;
  group: EventGroup | null;
  startMs: number;
  endMs: number;
  trackIndex: number;
  pixiType: string;
  pixiStatus: string;
};

export type GetRowsOptions = {
  excludeWorkflowTasks?: boolean;
};

export type LatestGroupListener = (group: EventGroup) => void;

// ---------------------------------------------------------------------------
// Module state (reset between workflows via reset())
// ---------------------------------------------------------------------------

let eventSlots: (HistoryEvent | null)[] = [];
let eventToGroup = new Int32Array(0);
const groupPool: GroupMeta[] = [];
let poolTop = 0;

const ascGroupHeads: number[] = [];
const descGroupHeads: number[] = [];

// Used during streaming to assign track indices in the final bidirectional layout
// (desc events at top, asc events at bottom, loading gap in between).
let estimatedTotalGroups = 0;
const pendingFollowers = new Map<number, number[]>();
const pendingResolvers = new Map<number, ((g: EventGroup) => void)[]>();
const activePromises = new Map<number, Promise<EventGroup>>();

let failedEvent: HistoryEvent | null = null;
let latestEventSlotIdx = -1;
let latestEventRef: HistoryEvent | null = null;
const latestGroupListeners: LatestGroupListener[] = [];

// Followers from the live poll whose head event has not yet been processed by
// either appendLiveEvent or processEvent. Keyed by head event id string.
// Mirrors pendingFollowers (slot-index map) but stores WorkflowEvents directly
// because appendLiveEvent converts immediately and never writes to eventSlots.
const livePendingFollowers = new Map<string, WorkflowEvent[]>();

// Cache for getGroupArray() — invalidated whenever poolTop or liveGroups change.
// Avoids the 200KB+ slice+sort allocation on every call when the pool is
// stable (i.e. after fetch completes).
let _cachedGroups: EventGroup[] | null = null;
let _cachedPoolTop = -1;
let _cachedLiveVersion = -1;
// Separate cache for the WFT-excluded variant (used by the timeline).
let _cachedGroupsNoWFT: EventGroup[] | null = null;
let _cachedPoolTopNoWFT = -1;
let _cachedLiveVersionNoWFT = -1;
// Incremented each time liveGroups is modified so getGroupArray knows to bust.
let _liveVersion = 0;

// Accumulated WFT IDs for marker billable-action dedup (ascending cursor only)
const processedWorkflowTaskIds = new Set<string>();

// Solo events that don't form groups (e.g. WorkflowExecutionStarted/Completed).
// Kept separately so getEventArray() can return a complete flat event list.
const soloEvents: WorkflowEvent[] = [];
const soloEventIds = new Set<string>();

// ---------------------------------------------------------------------------
// Live-event state (separate from pre-allocated initial buffer)
// New events for running workflows are appended here — no reset of eventSlots.
// ---------------------------------------------------------------------------

const liveGroups: EventGroup[] = [];
const liveGroupListeners: LatestGroupListener[] = [];
// Tracks event IDs already seen by appendLiveEvent to prevent duplicates when
// live polling re-sends events that overlap with the initial fetch or prior polls.
const liveSeenIds = new Set<string>();

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function makeGroupMeta(): GroupMeta {
  return {
    headSlotIdx: -1,
    group: null,
    startMs: 0,
    endMs: 0,
    trackIndex: -1,
    pixiType: '',
    pixiStatus: '',
  };
}

function resetMeta(m: GroupMeta): void {
  m.headSlotIdx = -1;
  m.group = null;
  m.startMs = 0;
  m.endMs = 0;
  m.trackIndex = -1;
  m.pixiType = '';
  m.pixiStatus = '';
}

function toMs(t: unknown): number {
  if (!t) return 0;
  if (typeof t === 'number') return t;
  if (t instanceof Date) return t.getTime();
  if (typeof t === 'object') {
    const obj = t as Record<string, unknown>;
    if ('seconds' in obj) {
      return (
        Number(obj.seconds ?? 0) * 1000 + Number(obj.nanos ?? 0) / 1_000_000
      );
    }
  }
  return new Date(t as string).getTime();
}

function pascalToEventType(name: string): string {
  return (
    'EVENT_TYPE_' +
    name
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '')
  );
}

function groupToPixiType(group: EventGroup): string {
  switch (group.category) {
    case 'activity':
    case 'local-activity':
      return 'GROUP_ACTIVITY';
    case 'child-workflow':
      return 'GROUP_CHILD_WORKFLOW';
    case 'timer':
      return 'GROUP_TIMER';
    default:
      break;
  }
  if (group.initialEvent.eventType === 'WorkflowTaskScheduled') {
    return 'GROUP_WORKFLOW_TASK';
  }
  return pascalToEventType(group.initialEvent.eventType);
}

function groupToPixiStatus(group: EventGroup): string {
  if (group.isTerminated) return 'failed';
  if (group.isFailureOrTimedOut) return 'failed';
  if (group.isCanceled) return 'canceled';
  if (group.isPending) return 'started';
  const c = group.finalClassification ?? group.classification;
  switch (c) {
    case 'Completed':
      return 'completed';
    case 'Fired':
      return 'fired';
    case 'Signaled':
      return 'signaled';
    case 'Failed':
    case 'TimedOut':
    case 'Terminated':
      return 'failed';
    case 'Canceled':
    case 'CancelRequested':
      return 'canceled';
    case 'Started':
    case 'Open':
    case 'Running':
      return 'started';
    default:
      return 'scheduled';
  }
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

function insertEventById(list: WorkflowEvent[], event: WorkflowEvent): void {
  const id = Number(event.id);
  let i = list.length;
  while (i > 0 && Number(list[i - 1].id) > id) i--;
  list.splice(i, 0, event);
}

function invalidateGroupArrayCaches(): void {
  _cachedGroups = null;
  _cachedGroupsNoWFT = null;
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

function growArrays(newSize: number): void {
  if (newSize <= eventSlots.length) return;
  eventSlots.length = newSize;
  const grown = new Int32Array(newSize);
  grown.set(eventToGroup);
  eventToGroup = grown;
}

// Grow the slot arrays so `slotIdx` is addressable, with ~25% headroom.
function growArraysFor(slotIdx: number): void {
  if (slotIdx < eventSlots.length) return;
  growArrays(slotIdx + Math.ceil(slotIdx * 0.25) + 16);
}

function attachFollowerToPool(poolIdx: number, followerSlotIdx: number): void {
  // Guard: already claimed (e.g. livePendingFollowers flush already added this event).
  if (eventToGroup[followerSlotIdx] !== 0) {
    eventSlots[followerSlotIdx] = null;
    return;
  }

  const meta = groupPool[poolIdx];
  const raw = eventSlots[followerSlotIdx];
  if (!raw || !meta.group) return;

  const event = toWorkflowEvent(raw, false);
  insertEventById(meta.group.eventList, event);
  meta.group.timestamp = event.timestamp;
  addEventToGroup(meta.group, event);

  eventToGroup[followerSlotIdx] = poolIdx + 1;

  clearResolvedPendingState(meta.group);

  const followerMs = toMs(event.eventTime);
  if (followerMs > meta.endMs) meta.endMs = followerMs;

  invalidateGroupArrayCaches();
  eventSlots[followerSlotIdx] = null;
}

function attachFollower(headSlotIdx: number, followerSlotIdx: number): void {
  const poolIdx = eventToGroup[headSlotIdx];
  if (poolIdx !== 0) {
    attachFollowerToPool(poolIdx - 1, followerSlotIdx);
  } else {
    const pending = pendingFollowers.get(headSlotIdx);
    if (pending) {
      pending.push(followerSlotIdx);
    } else {
      pendingFollowers.set(headSlotIdx, [followerSlotIdx]);
    }
  }
}

function absorbLiveGroupIntoPool(poolIdx: number, liveGroup: EventGroup): void {
  const meta = groupPool[poolIdx];
  const group = meta.group;
  if (!group) return;

  for (const event of liveGroup.eventList) {
    const slotIdx = parseInt(event.id) - 1;
    growArraysFor(slotIdx);
    if (eventToGroup[slotIdx] !== 0) continue;
    if (group.eventList.some((existing) => existing.id === event.id)) continue;

    insertEventById(group.eventList, event);
    group.timestamp = event.timestamp;
    addEventToGroup(group, event);
    eventToGroup[slotIdx] = poolIdx + 1;
    const eventMs = toMs(event.eventTime);
    if (eventMs > meta.endMs) meta.endMs = eventMs;
  }

  clearResolvedPendingState(group);
  invalidateGroupArrayCaches();
}

// Returns a fresh group reference when pending metadata changed (so
// reference-tracking Svelte views re-derive — a pause/unpause appends no
// history event, leaving eventList and the old reference otherwise stable), or
// the same group when nothing changed.
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
    if (group.pendingActivity === next) {
      return group;
    }
    const clone = cloneEventGroup(group);
    clone.pendingActivity = next;
    return clone;
  }

  if (isNexusOperationScheduledEvent(initial)) {
    const pn = byNexusScheduledId.get(group.id);
    const next = pn && !hasTerminalNexusEvent(group) ? pn : undefined;
    if (group.pendingNexusOperation === next) {
      return group;
    }
    const clone = cloneEventGroup(group);
    clone.pendingNexusOperation = next;
    return clone;
  }

  return group;
}

function notifyLatestGroupListeners(group: EventGroup): void {
  for (const cb of latestGroupListeners) {
    cb(group);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * (Re)initialise the buffer for a new workflow fetch.
 * Call before starting fetchAllEventsBidirectional.
 */
export function reset(historyLength: number): void {
  const N = Math.max(historyLength + 16, 16);

  eventSlots = new Array<null>(N).fill(null);
  eventToGroup = new Int32Array(N);

  const maxGroups = Math.ceil(N / 1.5);
  while (groupPool.length < maxGroups) groupPool.push(makeGroupMeta());
  for (let i = 0; i < poolTop; i++) resetMeta(groupPool[i]);

  poolTop = 0;
  ascGroupHeads.length = 0;
  descGroupHeads.length = 0;
  pendingFollowers.clear();
  pendingResolvers.clear();
  activePromises.clear();
  processedWorkflowTaskIds.clear();
  failedEvent = null;
  latestEventSlotIdx = -1;
  latestEventRef = null;
  latestGroupListeners.length = 0;
  liveGroups.length = 0;
  liveGroupListeners.length = 0;
  soloEvents.length = 0;
  soloEventIds.clear();
  liveSeenIds.clear();
  livePendingFollowers.clear();
  _liveVersion = 0;
  _cachedGroups = null;
  _cachedPoolTop = -1;
  _cachedLiveVersion = -1;
  _cachedGroupsNoWFT = null;
  _cachedPoolTopNoWFT = -1;
  _cachedLiveVersionNoWFT = -1;
}

/**
 * Set the estimated total group count so streaming track indices use the
 * correct bidirectional layout (desc at top, asc at bottom).
 * Call this before starting fetchBidirectional, after reset().
 */
export function setEstimatedGroupCount(n: number): void {
  estimatedTotalGroups = n;
}

/**
 * Call from the descending cursor's onFirstDescPage hook to capture the
 * failedEvent used for billableActions calculation.
 */
export function setFailedEvent(raw: HistoryEvent | null): void {
  failedEvent = raw;
}

/**
 * Process a single raw HistoryEvent from either cursor.
 * isAscending: true = ascending cursor, false = descending cursor.
 * Returns the EventGroup when a new group HEAD is registered, null otherwise.
 */
export function processEvent(
  raw: HistoryEvent,
  isAscending: boolean,
): EventGroup | null {
  const slotIdx = parseInt(raw.eventId) - 1;

  growArraysFor(slotIdx);

  eventSlots[slotIdx] = raw;

  if (slotIdx > latestEventSlotIdx) {
    latestEventSlotIdx = slotIdx;
    latestEventRef = raw;
  }

  const event = toWorkflowEvent(raw, isAscending);
  const gid = getGroupId(event as CommonHistoryEvent);
  const isHead = gid === event.id;

  if (!isHead) {
    const headSlotIdx = parseInt(gid) - 1;
    attachFollower(headSlotIdx, slotIdx);
    // If the head already existed, attachFollowerToPool already nulled this slot.
    // If not, the slot stays live until the head arrives and flushes it.
    return null;
  }

  // Try both group dispatchers — createWorkflowTaskGroup handles WFT events
  const group =
    createEventGroup(event as CommonHistoryEvent) ??
    createWorkflowTaskGroup(event as CommonHistoryEvent);

  if (!group) {
    pendingFollowers.delete(slotIdx);
    if (!soloEventIds.has(event.id)) {
      soloEvents.push(event);
      soloEventIds.add(event.id);
    }
    eventSlots[slotIdx] = null;
    return null;
  }

  // Write-once guard: prevents double-registration at cursor boundary overlap
  if (eventToGroup[slotIdx] !== 0) {
    eventSlots[slotIdx] = null;
    return null;
  }

  if (poolTop >= groupPool.length) {
    groupPool.push(makeGroupMeta());
  }
  const poolIdx = poolTop++;
  const meta = groupPool[poolIdx];
  resetMeta(meta);
  meta.headSlotIdx = slotIdx;
  meta.group = group;

  const startMs = toMs(event.eventTime);
  meta.startMs = startMs;
  meta.endMs = startMs;
  meta.trackIndex = poolIdx;
  meta.pixiType = groupToPixiType(group);
  meta.pixiStatus = groupToPixiStatus(group);

  eventToGroup[slotIdx] = poolIdx + 1;

  if (meta.pixiType === 'GROUP_WORKFLOW_TASK') {
    // WFT groups are tracked in the pool but not rendered; skip track assignment.
    meta.trackIndex = -1;
  } else if (isAscending) {
    ascGroupHeads.push(slotIdx);
    // Fill from bottom: first asc group (oldest) → row (estimated - 1), etc.
    const estTotal =
      estimatedTotalGroups > 0 ? estimatedTotalGroups : poolTop + 64;
    meta.trackIndex = Math.max(
      descGroupHeads.length,
      estTotal - ascGroupHeads.length,
    );
  } else {
    descGroupHeads.push(slotIdx);
    // Fill from top: first desc group (newest) → row 0.
    meta.trackIndex = descGroupHeads.length - 1;
  }

  // Flush any followers that arrived before this head via the bidirectional fetch.
  // attachFollowerToPool nulls each follower slot after processing.
  const pending = pendingFollowers.get(slotIdx);
  if (pending) {
    for (const followerSlotIdx of pending) {
      attachFollowerToPool(poolIdx, followerSlotIdx);
    }
    pendingFollowers.delete(slotIdx);
  }

  // Flush any followers that arrived before this head via the live poll.
  // They are already converted WorkflowEvents — just insert and claim their slots.
  const liveFollowers = livePendingFollowers.get(event.id);
  if (liveFollowers) {
    for (const follower of liveFollowers) {
      const followerSlotIdx = parseInt(follower.id) - 1;
      if (followerSlotIdx >= eventToGroup.length) {
        growArrays(followerSlotIdx + 1);
      }
      // Guard: bidirectional flush may have already claimed this slot.
      if (eventToGroup[followerSlotIdx] !== 0) continue;
      insertEventById(group.eventList, follower);
      group.timestamp = follower.timestamp;
      addEventToGroup(group, follower);
      eventToGroup[followerSlotIdx] = poolIdx + 1;
      const followerMs = toMs(follower.eventTime);
      if (followerMs > meta.endMs) meta.endMs = followerMs;
    }
    clearResolvedPendingState(group);
    livePendingFollowers.delete(event.id);
    invalidateGroupArrayCaches();
  }

  const liveGroupIdx = liveGroups.findIndex((g) => g.id === event.id);
  if (liveGroupIdx !== -1) {
    const [liveGroup] = liveGroups.splice(liveGroupIdx, 1);
    absorbLiveGroupIntoPool(poolIdx, liveGroup);
    _liveVersion++;
  }

  // Release the head slot — its data is now encoded in the EventGroup.
  eventSlots[slotIdx] = null;

  // Resolve any pending getRows() promises for this group
  const resolvers = pendingResolvers.get(poolIdx);
  if (resolvers) {
    for (const resolve of resolvers) resolve(group);
    pendingResolvers.delete(poolIdx);
    activePromises.delete(poolIdx);
  }

  notifyLatestGroupListeners(group);
  return group;
}

/**
 * Call after both cursors complete to merge the two head lists into the
 * canonical ascending-order group list. Returns the merged array.
 * The internal ascGroupHeads and descGroupHeads are cleared.
 */
export function mergeHeads(): number[] {
  const merged = [...ascGroupHeads, ...descGroupHeads.reverse()];
  ascGroupHeads.length = 0;
  descGroupHeads.length = 0;
  return merged;
}

/** Total number of groups registered so far. */
export function getGroupCount(): number {
  return poolTop;
}

/**
 * Request a slice of EventGroup promises by group index range [start, end).
 * - Already-loaded groups → Promise.resolve(group)
 * - Not-yet-loaded groups → pending Promise that resolves when the cursor
 *   writes the head event for that group index
 * - opts.excludeWorkflowTasks: filter WorkflowTask groups from the slice
 */
export function getRows(
  start: number,
  end: number,
  opts?: GetRowsOptions,
): Promise<EventGroup>[] {
  const result: Promise<EventGroup>[] = [];
  for (let i = start; i < end; i++) {
    result.push(getGroupPromise(i, opts));
  }
  return result;
}

function getGroupPromise(
  poolIdx: number,
  opts?: GetRowsOptions,
): Promise<EventGroup> {
  if (poolIdx < poolTop) {
    const meta = groupPool[poolIdx];
    if (meta.group) {
      const group = meta.group;
      if (opts?.excludeWorkflowTasks && isWorkflowTaskGroup(group)) {
        return Promise.resolve(null as unknown as EventGroup);
      }
      return Promise.resolve(group);
    }
  }

  // Return existing pending promise for this index if one already exists
  const existing = activePromises.get(poolIdx);
  if (existing) return existing;

  const promise = new Promise<EventGroup>((resolve) => {
    const list = pendingResolvers.get(poolIdx);
    if (list) {
      list.push(resolve);
    } else {
      pendingResolvers.set(poolIdx, [resolve]);
    }
  });
  activePromises.set(poolIdx, promise);
  return promise;
}

/** The raw HistoryEvent with the highest eventId seen so far. O(1). */
export function getLatestEvent(): HistoryEvent | null {
  return latestEventRef;
}

/**
 * The EventGroup whose head has the highest eventId seen so far.
 * Resolves immediately if the group is already registered, otherwise
 * waits until the next group head is written.
 */
export function getLatestGroup(): Promise<EventGroup | null> {
  if (poolTop === 0) return Promise.resolve(null);
  return getGroupPromise(poolTop - 1);
}

/**
 * Subscribe to new group registrations at the tail (highest eventId end).
 * Fires once per new group head written by either cursor.
 * Returns an unsubscribe function.
 */
export function onLatestGroup(cb: LatestGroupListener): () => void {
  latestGroupListeners.push(cb);
  return () => {
    const idx = latestGroupListeners.indexOf(cb);
    if (idx !== -1) latestGroupListeners.splice(idx, 1);
  };
}

// ---------------------------------------------------------------------------
// Internal helpers (exported for testing)
// ---------------------------------------------------------------------------

export function isWorkflowTaskGroup(group: EventGroup): boolean {
  return group.initialEvent.eventType === 'WorkflowTaskScheduled';
}

/**
 * Post-fetch: annotate activity and nexus groups with pending metadata from
 * the workflow run. Call once after fetchBidirectional resolves.
 */
export function enrichGroups(
  pendingActivities: PendingActivity[],
  pendingNexusOperations: PendingNexusOperation[],
): void {
  const byActivityId = new Map(pendingActivities.map((p) => [p.activityId, p]));
  const byNexusScheduledId = new Map(
    pendingNexusOperations.map((p) => [String(p.scheduledEventId), p]),
  );

  let changed = false;

  for (let i = 0; i < poolTop; i++) {
    const meta = groupPool[i];
    if (!meta.group) continue;
    const next = enrichGroup(meta.group, byActivityId, byNexusScheduledId);
    if (next !== meta.group) {
      meta.group = next;
      changed = true;
    }
  }

  for (let i = 0; i < liveGroups.length; i++) {
    const next = enrichGroup(liveGroups[i], byActivityId, byNexusScheduledId);
    if (next !== liveGroups[i]) {
      liveGroups[i] = next;
      changed = true;
    }
  }

  if (changed) invalidateGroupArrayCaches();
}

/**
 * Returns the WorkflowTaskFailed/TimedOut event that is currently active
 * (i.e. has no subsequent WorkflowTaskCompleted), or undefined if none.
 * Mirrors the logic of getWorkflowTaskFailedEvent() but operates on buffer
 * groups instead of a flat event array.
 */
export function getWorkflowTaskFailedEvent(): WorkflowEvent | undefined {
  let lastFailedEvent: WorkflowEvent | undefined;
  let maxCompletedId = -1;

  const scanGroup = (group: EventGroup): void => {
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
  };

  for (let i = 0; i < poolTop; i++) {
    const { group } = groupPool[i];
    if (!group || !isWorkflowTaskGroup(group)) continue;
    scanGroup(group);
  }

  // Live WFT groups whose head slot has not yet been claimed by the pool —
  // covers workflow-task failures that arrive via the live poll after the
  // initial fetch completes.
  for (const group of liveGroups) {
    if (!isWorkflowTaskGroup(group)) continue;
    const headSlotIdx = parseInt(group.id) - 1;
    if (
      headSlotIdx >= 0 &&
      headSlotIdx < eventToGroup.length &&
      eventToGroup[headSlotIdx] !== 0
    ) {
      continue;
    }
    scanGroup(group);
  }

  if (!lastFailedEvent) return undefined;
  if (Number(lastFailedEvent.id) < maxCompletedId) return undefined;
  return lastFailedEvent;
}

/**
 * Synchronous sorted EventGroup[] after the fetch is complete.
 * Groups are ordered by ascending eventId (headSlotIdx sort).
 *
 * The result is cached per poolTop value.  During streaming, poolTop grows on
 * every new group so the cache misses every call — but the rAF throttle in the
 * layout already limits this to once per frame.  After the fetch completes,
 * poolTop is stable, so every subsequent call is O(1) with zero allocation.
 *
 * Both variants (all groups and WFT-excluded) are independently cached so
 * the timeline can call with excludeWorkflowTasks:true on the hot path.
 */
export function getGroupArray(opts?: GetRowsOptions): EventGroup[] {
  const excludeWFT = Boolean(opts?.excludeWorkflowTasks);
  if (excludeWFT) {
    if (
      _cachedGroupsNoWFT !== null &&
      _cachedPoolTopNoWFT === poolTop &&
      _cachedLiveVersionNoWFT === _liveVersion
    ) {
      return _cachedGroupsNoWFT;
    }
  } else {
    if (
      _cachedGroups !== null &&
      _cachedPoolTop === poolTop &&
      _cachedLiveVersion === _liveVersion
    ) {
      return _cachedGroups;
    }
  }

  const metas = groupPool
    .slice(0, poolTop)
    .sort((a, b) => a.headSlotIdx - b.headSlotIdx);
  const result: EventGroup[] = [];
  for (const meta of metas) {
    if (!meta.group) continue;
    if (excludeWFT && isWorkflowTaskGroup(meta.group)) continue;
    result.push(meta.group);
  }

  // Include live groups whose head slot is not yet claimed by groupPool.
  // Once processEvent claims the head, eventToGroup[slot] becomes non-zero
  // and the live group is excluded here to avoid duplicates.
  for (const g of liveGroups) {
    const headSlotIdx = parseInt(g.id) - 1;
    if (
      headSlotIdx >= 0 &&
      headSlotIdx < eventToGroup.length &&
      eventToGroup[headSlotIdx] !== 0
    ) {
      continue; // head claimed by groupPool — skip to avoid duplicate
    }
    if (excludeWFT && isWorkflowTaskGroup(g)) continue;
    result.push(g);
  }

  // Re-sort: live groups can sit anywhere in the event sequence.
  result.sort((a, b) => parseInt(a.id) - parseInt(b.id));

  if (excludeWFT) {
    _cachedGroupsNoWFT = result;
    _cachedPoolTopNoWFT = poolTop;
    _cachedLiveVersionNoWFT = _liveVersion;
  } else {
    _cachedGroups = result;
    _cachedPoolTop = poolTop;
    _cachedLiveVersion = _liveVersion;
  }
  return result;
}

/**
 * Direct read-only access to a pool entry's rendering metadata.
 * Returns null if poolIdx is out of range or the group is not yet registered.
 */
export function getGroupMeta(poolIdx: number): GroupMeta | null {
  if (poolIdx < 0 || poolIdx >= poolTop) return null;
  return groupPool[poolIdx];
}

/** Number of groups loaded by the ascending cursor. */
export function getAscGroupCount(): number {
  return ascGroupHeads.length;
}

/** Number of groups loaded by the descending cursor. */
export function getDescGroupCount(): number {
  return descGroupHeads.length;
}

/**
 * Finalize track indices after the full fetch completes.
 *
 * Layout (top → bottom):
 *   rows 0 .. descCount-1      – descending cursor groups, newest first (row 0)
 *   rows descCount .. total-ascCount-1  – (would be loading gap during streaming)
 *   rows total-ascCount .. total-1 – ascending cursor groups, oldest last (bottom)
 *
 * Also updates pixiStatus now that final classification is known.
 */
export function assignTrackIndices(): void {
  // Only non-WFT groups are in the head lists, so this total is the visible track count.
  const total = descGroupHeads.length + ascGroupHeads.length;

  // Descending groups arrive newest-first, so descGroupHeads[0] = newest event.
  for (let i = 0; i < descGroupHeads.length; i++) {
    const poolIdx = eventToGroup[descGroupHeads[i]] - 1;
    if (poolIdx < 0) continue;
    const meta = groupPool[poolIdx];
    meta.trackIndex = i;
    if (meta.group) meta.pixiStatus = groupToPixiStatus(meta.group);
  }

  // Ascending groups arrive oldest-first (ascGroupHeads[0] = event 1).
  // Place them with the oldest at the very bottom and the frontier (newest asc event)
  // adjacent to the loading gap, so the gap visually shrinks from both sides as data loads.
  for (let i = 0; i < ascGroupHeads.length; i++) {
    const poolIdx = eventToGroup[ascGroupHeads[i]] - 1;
    if (poolIdx < 0) continue;
    const meta = groupPool[poolIdx];
    meta.trackIndex = total - 1 - i;
    if (meta.group) meta.pixiStatus = groupToPixiStatus(meta.group);
  }
}

/** Number of visible (non-WFT) groups registered so far. */
export function getVisibleGroupCount(): number {
  return descGroupHeads.length + ascGroupHeads.length;
}

/** Read-only view of internal state for assertions in tests. */
export function _debugState() {
  return {
    poolTop,
    ascGroupHeadsLength: ascGroupHeads.length,
    descGroupHeadsLength: descGroupHeads.length,
    pendingFollowersSize: pendingFollowers.size,
    pendingResolversSize: pendingResolvers.size,
    latestEventSlotIdx,
  };
}

/** Test-only: exposes raw eventSlots so tests can assert Option-C nulling. */
export function _debugEventSlots(): readonly (HistoryEvent | null)[] {
  return eventSlots;
}

// ---------------------------------------------------------------------------
// getEventArray — flat WorkflowEvent[] built lazily from groupPool
// Used by EventSummaryTable which needs a flat sorted event list.
// ---------------------------------------------------------------------------

/**
 * Returns a flat WorkflowEvent[] of all events in ascending eventId order,
 * built by concatenating each group's eventList in head-slot order.
 * Includes live events appended via appendLiveEvent().
 */
export function getEventArray(): WorkflowEvent[] {
  const result: WorkflowEvent[] = [];
  const sorted = groupPool
    .slice(0, poolTop)
    .sort((a, b) => a.headSlotIdx - b.headSlotIdx);
  for (const meta of sorted) {
    if (meta.group) {
      for (const ev of meta.group.eventList) result.push(ev);
    }
  }
  // When the live poll runs concurrently with the bidirectional fetch an event
  // can land in liveGroups before processEvent writes it into groupPool. Once
  // processEvent claims it (eventToGroup[slotIdx] !== 0) we skip it here so it
  // is not counted twice.
  for (const g of liveGroups) {
    for (const ev of g.eventList) {
      const slotIdx = parseInt(ev.id) - 1;
      if (slotIdx < eventToGroup.length && eventToGroup[slotIdx] !== 0)
        continue;
      result.push(ev);
    }
  }
  for (const ev of soloEvents) result.push(ev);
  result.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  return result;
}

// ---------------------------------------------------------------------------
// Live-event API — append new events for running workflows after initial fetch
// ---------------------------------------------------------------------------

/**
 * Append a single new event from the live ascending long-poll.
 * Creates or extends a group using the same logic as processEvent, but stores
 * the result in liveGroups rather than the pre-allocated groupPool.
 * Does NOT call growArrays or touch eventSlots.
 */
/** Returns true if the event was new and added, false if it was a duplicate. */
export function appendLiveEvent(raw: HistoryEvent): boolean {
  if (liveSeenIds.has(raw.eventId)) return false;
  liveSeenIds.add(raw.eventId);

  // If this event was already processed into groupPool during the initial fetch,
  // skip it — otherwise getEventArray() would return it from both groupPool and liveGroups.
  const slotIdx = parseInt(raw.eventId) - 1;
  if (slotIdx < eventToGroup.length && eventToGroup[slotIdx] !== 0)
    return false;

  const event = toWorkflowEvent(raw, true);
  const gid = getGroupId(event as CommonHistoryEvent);
  const isHead = gid === event.id;

  if (!isHead) {
    // Option A: head already in a live group — extend it directly.
    const existingIdx = liveGroups.findIndex((g) => g.id === gid);
    if (existingIdx !== -1) {
      const existing = liveGroups[existingIdx];
      insertEventById(existing.eventList, event);
      existing.timestamp = event.timestamp;
      addEventToGroup(existing, event);
      clearResolvedPendingState(existing);
      // Swap in a fresh reference so reference-tracking views re-derive from
      // the grown eventList / cleared pending (a live follower mutates in place).
      liveGroups[existingIdx] = cloneEventGroup(existing);
      _liveVersion++;
      invalidateGroupArrayCaches();
      return true;
    }

    // Option B: head already in groupPool — extend the real group directly.
    const headSlotIdx = parseInt(gid) - 1;
    if (
      headSlotIdx >= 0 &&
      headSlotIdx < eventToGroup.length &&
      eventToGroup[headSlotIdx] !== 0
    ) {
      const meta = groupPool[eventToGroup[headSlotIdx] - 1];
      if (meta?.group) {
        insertEventById(meta.group.eventList, event);
        meta.group.timestamp = event.timestamp;
        addEventToGroup(meta.group, event);
        clearResolvedPendingState(meta.group);
        // Swap in a fresh reference so reference-tracking views re-derive from
        // the grown eventList / cleared pending (a live follower mutates in place).
        meta.group = cloneEventGroup(meta.group);
        growArraysFor(slotIdx);
        eventToGroup[slotIdx] = eventToGroup[headSlotIdx];
        const followerMs = toMs(event.eventTime);
        if (followerMs > meta.endMs) {
          meta.endMs = followerMs;
        }
        invalidateGroupArrayCaches();
      }
      return true;
    }

    // Head not yet loaded — park this follower until the head arrives (via
    // appendLiveEvent or processEvent). Mirrors the bidirectional pendingFollowers
    // pattern: no group is created, no UI update until we have the head.
    const parked = livePendingFollowers.get(gid);
    if (parked) {
      parked.push(event);
    } else {
      livePendingFollowers.set(gid, [event]);
    }
    return true;
  }

  // This event is the head of a group.
  const group =
    createEventGroup(event as CommonHistoryEvent) ??
    createWorkflowTaskGroup(event as CommonHistoryEvent);
  if (!group) {
    if (!soloEventIds.has(event.id)) {
      soloEvents.push(event);
      soloEventIds.add(event.id);
    }
    return true;
  }

  // Flush any followers that parked while waiting for this head.
  const parked = livePendingFollowers.get(event.id);
  if (parked) {
    for (const follower of parked) {
      insertEventById(group.eventList, follower);
      group.timestamp = follower.timestamp;
      addEventToGroup(group, follower);
    }
    clearResolvedPendingState(group);
    livePendingFollowers.delete(event.id);
  }

  liveGroups.push(group);
  _liveVersion++;
  invalidateGroupArrayCaches();
  for (const cb of liveGroupListeners) cb(group);
  for (const cb of latestGroupListeners) cb(group);
  return true;
}

/** Number of live groups appended since the initial fetch completed. */
export function getLiveGroupCount(): number {
  return liveGroups.length;
}

/**
 * Subscribe to new live group registrations.
 * Returns an unsubscribe function.
 */
export function onLiveGroup(cb: LatestGroupListener): () => void {
  liveGroupListeners.push(cb);
  return () => {
    const idx = liveGroupListeners.indexOf(cb);
    if (idx !== -1) liveGroupListeners.splice(idx, 1);
  };
}

/** Clear liveGroups on reset so they don't carry over to the next workflow. */
export function resetLive(): void {
  liveGroups.length = 0;
  liveGroupListeners.length = 0;
  liveSeenIds.clear();
  livePendingFollowers.clear();
  _liveVersion = 0;
  _cachedGroups = null;
  _cachedGroupsNoWFT = null;
  _cachedLiveVersion = -1;
  _cachedLiveVersionNoWFT = -1;
}
