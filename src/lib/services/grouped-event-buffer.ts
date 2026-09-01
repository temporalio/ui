import {
  addEventToGroup,
  createEventGroup,
  createWorkflowTaskGroup,
  groupCategory,
  groupIsPending,
  isGroupHeadEvent,
} from '$lib/models/event-groups/create-event-group';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { getGroupId } from '$lib/models/event-groups/get-group-id';
import { toEvent } from '$lib/models/event-history';
import {
  createTimelineEventMarkerGroups,
  type EventGroupMarkerPresentation,
  type EventMarkerAttribution,
  getEventGroupMarkerKey,
  getEventGroupMarkerPresentation,
  type TimelineEventMarkerGroup,
} from '$lib/models/event-marker-groups';
import type {
  CommonHistoryEvent,
  EventGroupMarker,
  HistoryEvent,
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
} from '$lib/types/events';
import {
  isFailedTaskEvent,
  isTimedOutTaskEvent,
  isWorkflowTaskFailedEventDueToReset,
} from '$lib/utilities/get-workflow-task-failed-event';
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
  return value instanceof GroupRecord;
}

/**
 * One per group for the lifetime of the run. Holds member slots rather than
 * events, so a LazyGroup costs no allocation — its fields are either stored at
 * head time or read straight out of `events`.
 *
 * INVARIANT: every field must agree with the same field on the materialized
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

  /**
   * Assigned as events arrive rather than derived per read: `category` and `id`
   * are read once per group per filter pass, and both event references would
   * otherwise be a lookup into a nullable array on every access.
   *
   * Non-null from the moment the head lands, which is also when `headsGroup`
   * becomes true — and only records heading a group are ever handed out.
   */
  readonly id: string;
  initialEvent!: WorkflowEvent;
  lastEvent!: WorkflowEvent;
  category: WorkflowEvent['category'] = 'workflow';
  headsGroup = false;
  hasTerminalActivity = false;
  hasTerminalNexus = false;
  private lastSlot = -1;

  constructor(readonly headSlot: number) {
    this.id = String(headSlot + 1);
  }

  addMember(slot: number, event: WorkflowEvent): void {
    this.slots.push(slot);
    if (slot > this.lastSlot) {
      this.lastSlot = slot;
      this.lastEvent = event;
    }
    if (isTerminalActivityEvent(event)) this.hasTerminalActivity = true;
    if (isTerminalNexusEvent(event)) this.hasTerminalNexus = true;
    if (slot === this.headSlot) {
      this.initialEvent = event;
      this.category = groupCategory(event);
      this.headsGroup = isGroupHeadEvent(event as CommonHistoryEvent);
    }
    // A head arriving picks pending metadata up; a terminal event drops it.
    applyPendingMetadataTo(this);
    this.version++;
  }

  get eventCount(): number {
    return this.slots.length;
  }

  get classification(): WorkflowEvent['classification'] {
    return this.initialEvent.classification;
  }

  get finalClassification(): WorkflowEvent['classification'] {
    return this.lastEvent.classification;
  }

  get isPending(): boolean {
    return groupIsPending(
      this.initialEvent,
      this.slots.length,
      this.pendingActivity,
      this.pendingNexusOperation,
    );
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

// Accumulated WFT IDs for marker billable-action dedup. Shared by both cursors
// and the live poll — the direction an event arrives from is a fetch detail,
// and one workflow task's markers bill once however they were loaded.
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
let cachedWftFailed: WorkflowEvent | undefined;
let cachedWftFailedRevision = -1;
let cachedEventMarkerGroups: TimelineEventMarkerGroup[] | null = null;

const eventGroupMarkerPresentationLabels = new Map<string, string>();
const eventGroupMarkerPresentations = new Map<
  string,
  EventGroupMarkerPresentation
>();
const eventMarkerAttributions = new Map<string, EventMarkerAttribution>();
const eventGroupMarkerKeysByLifecycleGroupId = new Map<string, Set<string>>();
const markerReferencedLifecycleGroupIds = new Set<string>();

const changeListeners = new Set<ChangeListener>();

// Pending metadata from the workflow run, held so a head event arriving later
// can pick its own up. Records currently carrying some are tracked so a walk is
// only needed when there is something to set or clear.
let pendingByActivityId = new Map<string, PendingActivity>();
let pendingByNexusScheduledId = new Map<string, PendingNexusOperation>();
const enrichedRecords = new Set<GroupRecord>();

/** Returns whether the record's pending metadata changed. */
function applyPendingMetadataTo(record: GroupRecord): boolean {
  const head = record.initialEvent;
  if (!head) return false;

  let pendingActivity: PendingActivity | undefined;
  let pendingNexusOperation: PendingNexusOperation | undefined;

  // The run can still list an activity the history has already resolved, so a
  // terminal event wins. This is the only writer of the record's pending
  // fields, so gating here covers the lazy and materialized readings alike.
  if (!record.hasTerminalActivity && isActivityTaskScheduledEvent(head)) {
    pendingActivity = pendingByActivityId.get(
      head.activityTaskScheduledEventAttributes?.activityId ?? '',
    );
  } else if (!record.hasTerminalNexus && isNexusOperationScheduledEvent(head)) {
    pendingNexusOperation = pendingByNexusScheduledId.get(head.id);
  }

  if (
    record.pendingActivity === pendingActivity &&
    record.pendingNexusOperation === pendingNexusOperation
  ) {
    return false;
  }

  record.pendingActivity = pendingActivity;
  record.pendingNexusOperation = pendingNexusOperation;
  if (pendingActivity || pendingNexusOperation) {
    enrichedRecords.add(record);
  } else {
    enrichedRecords.delete(record);
  }
  record.version++;
  return true;
}

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

function formatEventGroupMarkerPresentationLabel(
  name: string,
  id: string,
): string {
  return `${name} (${id})`;
}

function indexEventGroupMarkerPresentationLabel(event: WorkflowEvent): void {
  let markerKey: string | undefined;
  let presentationLabel: string | undefined;

  if (event.eventType === 'WorkflowExecutionStarted') {
    markerKey = `event:${event.id}`;
    presentationLabel = formatEventGroupMarkerPresentationLabel(
      event.eventType,
      event.id,
    );
  } else if (event.eventType === 'WorkflowExecutionSignaled') {
    const signalName = (event.attributes as { signalName?: unknown })
      .signalName;
    markerKey = `event:${event.id}`;
    presentationLabel = formatEventGroupMarkerPresentationLabel(
      typeof signalName === 'string' && signalName
        ? signalName
        : event.eventType,
      event.id,
    );
  } else if (event.eventType === 'WorkflowExecutionUpdateAdmitted') {
    const request = (
      event.attributes as {
        request?: {
          meta?: { updateId?: unknown };
          input?: { name?: unknown };
        };
      }
    ).request;
    const updateId = request?.meta?.updateId;
    if (typeof updateId !== 'string' || !updateId) return;
    const updateName = request?.input?.name;
    markerKey = `update:${updateId}`;
    presentationLabel = formatEventGroupMarkerPresentationLabel(
      typeof updateName === 'string' && updateName
        ? updateName
        : event.eventType,
      updateId,
    );
  } else if (event.eventType === 'WorkflowExecutionUpdateAccepted') {
    const attributes = event.attributes as {
      acceptedRequest?: {
        meta?: { updateId?: unknown };
        input?: { name?: unknown };
      };
      protocolInstanceId?: unknown;
    };
    const request = attributes.acceptedRequest;
    const updateId =
      typeof request?.meta?.updateId === 'string'
        ? request.meta.updateId
        : typeof attributes.protocolInstanceId === 'string'
          ? attributes.protocolInstanceId
          : undefined;
    if (!updateId) return;
    markerKey = `update:${updateId}`;
    const updateName = request?.input?.name;
    if (
      !(typeof updateName === 'string' && updateName) &&
      eventGroupMarkerPresentationLabels.has(markerKey)
    ) {
      return;
    }
    presentationLabel = formatEventGroupMarkerPresentationLabel(
      typeof updateName === 'string' && updateName
        ? updateName
        : event.eventType,
      updateId,
    );
  }

  if (!markerKey || !presentationLabel) return;
  if (eventGroupMarkerPresentationLabels.get(markerKey) === presentationLabel) {
    return;
  }
  eventGroupMarkerPresentationLabels.set(markerKey, presentationLabel);
  const marker = eventMarkerAttributions.get(markerKey)?.eventGroupMarker;
  if (marker && refreshEventGroupMarkerPresentation(markerKey, marker)) {
    cachedEventMarkerGroups = null;
  }
}

function refreshEventGroupMarkerPresentation(
  key: string,
  marker: EventGroupMarker,
): boolean {
  const presentation = getEventGroupMarkerPresentation(
    marker,
    eventGroupMarkerPresentationLabels,
  );
  if (!presentation) return false;
  const previous = eventGroupMarkerPresentations.get(key);
  if (
    previous?.displayName === presentation.displayName &&
    previous.label === presentation.label
  ) {
    return false;
  }
  eventGroupMarkerPresentations.set(key, presentation);
  return true;
}

function toWorkflowEvent(raw: HistoryEvent): WorkflowEvent {
  const event = toEvent(raw, {
    shouldNotAddBillableAction,
    processedWorkflowTaskIds,
  });
  indexEventGroupMarkerPresentationLabel(event);
  return event;
}

function attributeEventMarkers(event: WorkflowEvent, groupId: string): void {
  let changed = false;
  for (const marker of event.eventGroupMarkers ?? []) {
    const key = getEventGroupMarkerKey(marker);
    if (!key) continue;

    let groupMarkerKeys = eventGroupMarkerKeysByLifecycleGroupId.get(groupId);
    if (!groupMarkerKeys) {
      groupMarkerKeys = new Set();
      eventGroupMarkerKeysByLifecycleGroupId.set(groupId, groupMarkerKeys);
    }
    groupMarkerKeys.add(key);
    markerReferencedLifecycleGroupIds.add(groupId);

    let attribution = eventMarkerAttributions.get(key);
    if (!attribution) {
      attribution = { key, eventGroupMarker: marker, eventsById: new Map() };
      eventMarkerAttributions.set(key, attribution);
      refreshEventGroupMarkerPresentation(key, marker);
      changed = true;
    } else if (
      marker.label?.label &&
      !attribution.eventGroupMarker.label?.label
    ) {
      attribution.eventGroupMarker = marker;
      refreshEventGroupMarkerPresentation(key, marker);
      changed = true;
    }

    if (!attribution.eventsById.has(event.id)) {
      attribution.eventsById.set(event.id, {
        event,
        lifecycleGroupId: groupId,
      });
      changed = true;
    }
  }
  if (changed) cachedEventMarkerGroups = null;
}

export function getEventMarkerPresentation(
  marker: EventGroupMarker,
): EventGroupMarkerPresentation | undefined {
  const key = getEventGroupMarkerKey(marker);
  if (!key) return;
  const existing = eventGroupMarkerPresentations.get(key);
  if (existing) return existing;
  refreshEventGroupMarkerPresentation(key, marker);
  return eventGroupMarkerPresentations.get(key);
}

export function hasEventMarkerGroups(): boolean {
  return eventMarkerAttributions.size > 0;
}

export function lazyGroupMatchesEventGroupFilter(
  group: LazyGroup,
  markerKeys: ReadonlySet<string>,
): boolean {
  if (!markerKeys.size) return true;
  const groupMarkerKeys = eventGroupMarkerKeysByLifecycleGroupId.get(group.id);
  if (!groupMarkerKeys) return false;
  for (const key of markerKeys) {
    if (groupMarkerKeys.has(key)) return true;
  }
  return false;
}

function recordFor(headSlot: number): GroupRecord {
  const existing = headGroup[headSlot];
  if (existing !== 0) return records[existing - 1];

  const record = new GroupRecord(headSlot);
  records.push(record);
  headGroup[headSlot] = records.length;
  return record;
}

function isTerminalActivityEvent(event: WorkflowEvent): boolean {
  return (
    isActivityTaskCompletedEvent(event) ||
    isActivityTaskFailedEvent(event) ||
    isActivityTaskCanceledEvent(event) ||
    isActivityTaskTimedOutEvent(event)
  );
}

function isTerminalNexusEvent(event: WorkflowEvent): boolean {
  return (
    isNexusOperationCompletedEvent(event) ||
    isNexusOperationFailedEvent(event) ||
    isNexusOperationCanceledEvent(event) ||
    isNexusOperationTimedOutEvent(event)
  );
}

// Pending metadata is applied as a derived read rather than stored on the
// group, so a terminal event and a stale pending entry can arrive in either
// order without leaving the group reporting isPending alongside a completion.
function applyPendingMetadata(group: EventGroup, record: GroupRecord): void {
  // Copies rather than re-deciding — the record is already correct.
  group.pendingActivity = record.pendingActivity;
  group.pendingNexusOperation = record.pendingNexusOperation;
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
  enrichedRecords.clear();
  pendingByActivityId = new Map();
  pendingByNexusScheduledId = new Map();
  maxSlot = -1;

  failedEvent = null;
  processedWorkflowTaskIds.clear();
  eventGroupMarkerPresentationLabels.clear();
  eventGroupMarkerPresentations.clear();
  eventMarkerAttributions.clear();
  eventGroupMarkerKeysByLifecycleGroupId.clear();
  markerReferencedLifecycleGroupIds.clear();

  revision++;
  cachedGroups = null;
  cachedGroupsNoWFT = null;
  cachedEvents = null;
  cachedLazyGroups = null;
  cachedLazyGroupsNoWFT = null;
  cachedEventMarkerGroups = null;

  notifyChanged(true);
}

/**
 * The reset point past which events stop counting toward billableActions.
 * Currently unwired — no production caller supplies it.
 */
export function setFailedEvent(raw: HistoryEvent | null): void {
  failedEvent = raw;
}

/**
 * Add one raw HistoryEvent from either fetch cursor or the live poll.
 * Returns false when the event was already present.
 */
export function ingestHistoryEvent(raw: HistoryEvent): boolean {
  const slot = parseInt(raw.eventId) - 1;
  if (!(slot >= 0)) return false;

  grow(slot);
  if (events[slot]) return false;

  const event = toWorkflowEvent(raw);
  events[slot] = event;
  if (slot > maxSlot) maxSlot = slot;

  // An event whose head is unknown (malformed attributes) heads its own group.
  const parsedHeadSlot = parseInt(getGroupId(event as CommonHistoryEvent)) - 1;
  const headSlot = parsedHeadSlot >= 0 ? parsedHeadSlot : slot;
  grow(headSlot);

  const groupId = String(headSlot + 1);
  recordFor(headSlot).addMember(slot, event);
  attributeEventMarkers(event, groupId);
  if (markerReferencedLifecycleGroupIds.has(groupId)) {
    cachedEventMarkerGroups = null;
  }
  revision++;

  notifyChanged();
  return true;
}

/**
 * Annotate activity and nexus groups with pending metadata from the workflow
 * run. Safe to call repeatedly — groups whose pending entry is unchanged keep
 * their existing reference.
 */
export function setPendingMetadata(
  pendingActivities: PendingActivity[],
  pendingNexusOperations: PendingNexusOperation[],
): void {
  pendingByActivityId = new Map(
    pendingActivities.map((pending) => [pending.activityId, pending]),
  );
  pendingByNexusScheduledId = new Map(
    pendingNexusOperations.map((pending) => [
      String(pending.scheduledEventId),
      pending,
    ]),
  );

  const nothingPending =
    pendingByActivityId.size === 0 && pendingByNexusScheduledId.size === 0;
  if (nothingPending && enrichedRecords.size === 0) return;

  let changed = false;
  for (const record of records) {
    if (!record.headsGroup) continue;
    if (applyPendingMetadataTo(record)) {
      revision++;
      changed = true;
      if (markerReferencedLifecycleGroupIds.has(record.id)) {
        cachedEventMarkerGroups = null;
      }
    }
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
    if (!record.headsGroup) continue;
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
  if (lazy instanceof GroupRecord) {
    return materializeEventGroup(lazy) as EventGroup;
  }
  return lazy as EventGroup;
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

/**
 * Event Group rows derived from marker attribution. Only lifecycle groups
 * referenced by a marker are materialized; the normal timeline remains lazy.
 */
export function getEventMarkerGroupArray(): TimelineEventMarkerGroup[] {
  if (cachedEventMarkerGroups) return cachedEventMarkerGroups;

  const referencedGroupIds = new Set<string>();
  for (const attribution of eventMarkerAttributions.values()) {
    for (const entry of attribution.eventsById.values()) {
      referencedGroupIds.add(entry.lifecycleGroupId);
    }
  }

  const lifecycleGroups: EventGroup[] = [];
  for (const groupId of referencedGroupIds) {
    const headSlot = Number(groupId) - 1;
    const recordIndex = headGroup[headSlot];
    if (!recordIndex) continue;
    const group = materializeEventGroup(records[recordIndex - 1]);
    if (group) lifecycleGroups.push(group);
  }

  cachedEventMarkerGroups = createTimelineEventMarkerGroups(
    eventMarkerAttributions.values(),
    lifecycleGroups,
    eventGroupMarkerPresentations,
  );
  return cachedEventMarkerGroups;
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
  if (cachedWftFailedRevision === revision) return cachedWftFailed;

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
      (isFailedTaskEvent(event) || isTimedOutTaskEvent(event)) &&
      !isWorkflowTaskFailedEventDueToReset(event)
    ) {
      lastFailedEvent = event;
    }
  }

  cachedWftFailedRevision = revision;
  cachedWftFailed =
    lastFailedEvent && Number(lastFailedEvent.id) >= maxCompletedId
      ? lastFailedEvent
      : undefined;
  return cachedWftFailed;
}
