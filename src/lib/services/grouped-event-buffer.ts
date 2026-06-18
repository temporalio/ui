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
  WorkflowEvent,
} from '$lib/types/events';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type GroupMeta = {
  headSlotIdx: number;
  group: EventGroup | null;
};

export type GetRowsOptions = {
  excludeWorkflowTasks?: boolean;
};

export type LatestGroupListener = (group: EventGroup) => void;

// ---------------------------------------------------------------------------
// Module state (reset between workflows via reset())
// ---------------------------------------------------------------------------

let eventSlots: (HistoryEvent | undefined)[] = [];
let eventToGroup = new Int32Array(0);
const groupPool: GroupMeta[] = [];
let poolTop = 0;

const ascGroupHeads: number[] = [];
const descGroupHeads: number[] = [];
const pendingFollowers = new Map<number, number[]>();
const pendingResolvers = new Map<number, ((g: EventGroup) => void)[]>();
const activePromises = new Map<number, Promise<EventGroup>>();

let failedEvent: HistoryEvent | null = null;
let latestEventSlotIdx = -1;
const latestGroupListeners: LatestGroupListener[] = [];

// Accumulated WFT IDs for marker billable-action dedup (ascending cursor only)
const processedWorkflowTaskIds = new Set<string>();

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function makeGroupMeta(): GroupMeta {
  return { headSlotIdx: -1, group: null };
}

function resetMeta(m: GroupMeta): void {
  m.headSlotIdx = -1;
  m.group = null;
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

function growArrays(newSize: number): void {
  if (newSize <= eventSlots.length) return;
  eventSlots.length = newSize;
  const grown = new Int32Array(newSize);
  grown.set(eventToGroup);
  eventToGroup = grown;
}

function attachFollowerToPool(poolIdx: number, followerSlotIdx: number): void {
  const meta = groupPool[poolIdx];
  const raw = eventSlots[followerSlotIdx];
  if (!raw || !meta.group) return;

  const event = toWorkflowEvent(raw, false);
  meta.group.eventList.push(event);
  meta.group.timestamp = event.timestamp;
  addEventToGroup(meta.group, event);

  eventToGroup[followerSlotIdx] = poolIdx + 1;

  if (meta.group.pendingActivity && meta.group.eventList.length === 3) {
    delete meta.group.pendingActivity;
  }
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

  eventSlots = new Array(N);
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
  latestGroupListeners.length = 0;
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
 */
export function processEvent(raw: HistoryEvent, isAscending: boolean): void {
  const slotIdx = parseInt(raw.eventId) - 1;

  if (slotIdx >= eventSlots.length) {
    growArrays(slotIdx + Math.ceil(slotIdx * 0.25) + 16);
  }

  eventSlots[slotIdx] = raw;

  if (slotIdx > latestEventSlotIdx) {
    latestEventSlotIdx = slotIdx;
  }

  const event = toWorkflowEvent(raw, isAscending);
  const gid = getGroupId(event as CommonHistoryEvent);
  const isHead = gid === event.id;

  if (!isHead) {
    const headSlotIdx = parseInt(gid) - 1;
    attachFollower(headSlotIdx, slotIdx);
    return;
  }

  // Try both group dispatchers — createWorkflowTaskGroup handles WFT events
  const group =
    createEventGroup(event as CommonHistoryEvent) ??
    createWorkflowTaskGroup(event as CommonHistoryEvent);

  if (!group) {
    // Solo event: discard any orphaned pending followers
    pendingFollowers.delete(slotIdx);
    return;
  }

  // Write-once guard: prevents double-registration at cursor boundary overlap
  if (eventToGroup[slotIdx] !== 0) return;

  if (poolTop >= groupPool.length) {
    groupPool.push(makeGroupMeta());
  }
  const poolIdx = poolTop++;
  const meta = groupPool[poolIdx];
  resetMeta(meta);
  meta.headSlotIdx = slotIdx;
  meta.group = group;

  eventToGroup[slotIdx] = poolIdx + 1;

  if (isAscending) {
    ascGroupHeads.push(slotIdx);
  } else {
    descGroupHeads.push(slotIdx);
  }

  // Flush any followers that arrived before this head
  const pending = pendingFollowers.get(slotIdx);
  if (pending) {
    for (const followerSlotIdx of pending) {
      attachFollowerToPool(poolIdx, followerSlotIdx);
    }
    pendingFollowers.delete(slotIdx);
  }

  // Resolve any pending getRows() promises for this group
  const resolvers = pendingResolvers.get(poolIdx);
  if (resolvers) {
    for (const resolve of resolvers) resolve(group);
    pendingResolvers.delete(poolIdx);
    activePromises.delete(poolIdx);
  }

  notifyLatestGroupListeners(group);
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
  if (latestEventSlotIdx < 0) return null;
  return eventSlots[latestEventSlotIdx] ?? null;
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
