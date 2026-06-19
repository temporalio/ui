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
  isActivityTaskScheduledEvent,
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

let eventSlots: (HistoryEvent | undefined)[] = [];
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
const latestGroupListeners: LatestGroupListener[] = [];

// Accumulated WFT IDs for marker billable-action dedup (ascending cursor only)
const processedWorkflowTaskIds = new Set<string>();

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

  const followerMs = toMs(event.eventTime);
  if (followerMs > meta.endMs) meta.endMs = followerMs;
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
    return null;
  }

  // Try both group dispatchers — createWorkflowTaskGroup handles WFT events
  const group =
    createEventGroup(event as CommonHistoryEvent) ??
    createWorkflowTaskGroup(event as CommonHistoryEvent);

  if (!group) {
    // Solo event: discard any orphaned pending followers
    pendingFollowers.delete(slotIdx);
    return null;
  }

  // Write-once guard: prevents double-registration at cursor boundary overlap
  if (eventToGroup[slotIdx] !== 0) return null;

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

  if (isAscending) {
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

  for (let i = 0; i < poolTop; i++) {
    const { group } = groupPool[i];
    if (!group) continue;

    const initial = group.initialEvent;

    if (isActivityTaskScheduledEvent(initial)) {
      const pa = byActivityId.get(
        initial.activityTaskScheduledEventAttributes?.activityId,
      );
      if (pa && group.eventList.length < 3) {
        group.pendingActivity = pa;
      } else {
        delete group.pendingActivity;
      }
      continue;
    }

    if (isNexusOperationScheduledEvent(initial)) {
      const pn = byNexusScheduledId.get(group.id);
      const isComplete = group.eventList.some(
        (e) =>
          isNexusOperationCompletedEvent(e) ||
          isNexusOperationFailedEvent(e) ||
          isNexusOperationCanceledEvent(e) ||
          isNexusOperationTimedOutEvent(e),
      );
      if (pn && !isComplete) {
        group.pendingNexusOperation = pn;
      } else {
        delete group.pendingNexusOperation;
      }
    }
  }
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

  for (let i = 0; i < poolTop; i++) {
    const { group } = groupPool[i];
    if (!group || !isWorkflowTaskGroup(group)) continue;

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

/**
 * Synchronous sorted EventGroup[] after the fetch is complete.
 * Groups are ordered by ascending eventId (headSlotIdx sort).
 */
export function getGroupArray(opts?: GetRowsOptions): EventGroup[] {
  const metas = groupPool
    .slice(0, poolTop)
    .sort((a, b) => a.headSlotIdx - b.headSlotIdx);
  const result: EventGroup[] = [];
  for (const meta of metas) {
    if (!meta.group) continue;
    if (opts?.excludeWorkflowTasks && isWorkflowTaskGroup(meta.group)) continue;
    result.push(meta.group);
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
  const total = poolTop;

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
