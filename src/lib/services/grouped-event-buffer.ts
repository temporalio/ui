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
};

export type GroupArrayOptions = {
  excludeWorkflowTasks?: boolean;
};

// ---------------------------------------------------------------------------
// Module state (reset between workflows via reset())
// ---------------------------------------------------------------------------

let eventSlots: (HistoryEvent | null)[] = [];
let eventToGroup = new Int32Array(0);
const groupPool: GroupMeta[] = [];
let poolTop = 0;

const pendingFollowers = new Map<number, number[]>();

let failedEvent: HistoryEvent | null = null;

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
  };
}

function resetMeta(meta: GroupMeta): void {
  meta.headSlotIdx = -1;
  meta.group = null;
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
  const group = groupPool[poolIdx].group;
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
  pendingFollowers.clear();
  processedWorkflowTaskIds.clear();
  failedEvent = null;
  liveGroups.length = 0;
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

  eventToGroup[slotIdx] = poolIdx + 1;

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

  return group;
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
export function getGroupArray(opts?: GroupArrayOptions): EventGroup[] {
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

/** Read-only view of internal state for assertions in tests. */
export function _debugState() {
  return {
    poolTop,
    pendingFollowersSize: pendingFollowers.size,
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
    const existing = liveGroups.find((g) => g.id === gid);
    if (existing) {
      insertEventById(existing.eventList, event);
      existing.timestamp = event.timestamp;
      addEventToGroup(existing, event);
      clearResolvedPendingState(existing);
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
        growArraysFor(slotIdx);
        eventToGroup[slotIdx] = eventToGroup[headSlotIdx];
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
  return true;
}
