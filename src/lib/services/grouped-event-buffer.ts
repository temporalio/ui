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
  createEventGroupLabelRegistry,
  type EventGroupKey,
  type EventGroupLabel,
} from '$lib/models/event-history/event-group-markers';
import {
  type TimelineEventGroup,
  toTimelineEventGroup,
} from '$lib/models/event-history/timeline-event-groups';
import type {
  CommonHistoryEvent,
  HistoryEvent,
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
  WorkflowExecutionStartedEvent,
} from '$lib/types/events';
import { getValidTimeMs } from '$lib/utilities/format-time';
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
  isWorkflowExecutionStartedEvent,
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
  eventGroupKeys: EventGroupKey[] | undefined;
  syncedVersion = 0;
  syncedEventCount = 0;
  syncedPending = false;
  private lastSlot = -1;

  constructor(
    readonly headSlot: number,
    private readonly applyPendingMetadata: (record: GroupRecord) => boolean,
    private readonly materializeRecord: (
      record: GroupRecord,
    ) => EventGroup | null,
  ) {
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
    this.applyPendingMetadata(this);
    this.version++;
  }

  materialize(): EventGroup | null {
    return this.materializeRecord(this);
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

export type EventGroupOption = {
  group: EventGroupLabel;
  eventCount: number;
  firstEventId: number;
};

type EventGroupIndexEntry = EventGroupOption & {
  headSlots: Set<number>;
  lifecycle: GroupRecord[];
  lifecycleSorted: boolean;
  lifecycleEventCount: number;
  lifecycleVersion: number;
  pendingCount: number;
  initialEvent: WorkflowEvent | undefined;
  lastEvent: WorkflowEvent | undefined;
};

export type EventGroupMatcher = {
  hasGroup: (groupId: string) => boolean;
  hasEvent: (event: WorkflowEvent) => boolean;
};

export type GroupArrayOptions = {
  excludeWorkflowTasks?: boolean;
};

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

export function isWorkflowTaskGroup(group: EventGroup | LazyGroup): boolean {
  return group.initialEvent.eventType === 'WorkflowTaskScheduled';
}

const NO_EVENT_GROUP_KEYS: readonly EventGroupKey[] = [];

function isTimelineLifecycle(record: GroupRecord): boolean {
  return record.headsGroup && !isWorkflowTaskGroup(record);
}

function isLaterEvent(
  event: WorkflowEvent,
  than: WorkflowEvent | undefined,
): boolean {
  return !than || Number(event.id) > Number(than.id);
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
    return lazy.materialize() as EventGroup;
  }
  return lazy as EventGroup;
}

export function createGroupedEventBuffer() {
  // ---------------------------------------------------------------------------
  // Buffer state (reset between workflows via reset())
  // ---------------------------------------------------------------------------

  let events: (WorkflowEvent | null)[] = [];
  let headGroup = new Int32Array(0); // head slot -> record index + 1 (0 = none)
  let records: GroupRecord[] = [];
  let maxSlot = -1;

  let failedEvent: HistoryEvent | null = null;
  let initialEvent: WorkflowExecutionStartedEvent | undefined;
  let latestEventTimeMs: number | undefined;

  // Accumulated WFT IDs for marker billable-action dedup. Shared by both cursors
  // and the live poll — the direction an event arrives from is a fetch detail,
  // and one workflow task's markers bill once however they were loaded.
  const processedWorkflowTaskIds = new Set<string>();
  const createLabelRegistry = () =>
    createEventGroupLabelRegistry({
      onLabelChange: (key) => dirtyTimelineEventGroupKeys.add(key),
    });
  let eventGroupLabels = createLabelRegistry();

  // Event group key -> the events carrying that marker and the lifecycle groups
  // they belong to, so the event group filter is a set lookup per row.
  let eventGroupIndex = new Map<EventGroupKey, EventGroupIndexEntry>();
  let cachedEventGroupOptions: EventGroupOption[] | null = null;
  let cachedEventGroupOptionsRevision = -1;
  let timelineEventGroupsByKey = new Map<
    EventGroupKey,
    TimelineEventGroup<LazyGroup>
  >();
  const dirtyTimelineEventGroupKeys = new Set<EventGroupKey>();
  let timelineEventGroupCount = 0;
  let cachedTimelineEventGroups: TimelineEventGroup<LazyGroup>[] | null = null;
  let cachedTimelineEventGroupsRevision = -1;

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

  const changeListeners = new Set<ChangeListener>();

  // Pending metadata from the workflow run, held so a head event arriving later
  // can pick its own up. Records currently carrying some are tracked so a walk is
  // only needed when there is something to set or clear.
  let pendingByActivityId = new Map<string, PendingActivity>();
  let pendingByNexusScheduledId = new Map<string, PendingNexusOperation>();
  const enrichedRecords = new Set<GroupRecord>();

  // Head event of each currently-pending activity's group, keyed by activityId.
  // Maintained alongside enrichedRecords so a pending-activity card can diff its
  // current options against the ones it was scheduled with without scanning. The
  // head is always ActivityTaskScheduled: that is the only branch in
  // applyPendingMetadataTo that assigns pendingActivity.
  const scheduledEventByActivityId = new Map<string, WorkflowEvent>();

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
    } else if (
      !record.hasTerminalNexus &&
      isNexusOperationScheduledEvent(head)
    ) {
      pendingNexusOperation = pendingByNexusScheduledId.get(head.id);
    }

    if (
      record.pendingActivity === pendingActivity &&
      record.pendingNexusOperation === pendingNexusOperation
    ) {
      return false;
    }

    const previousActivityId = record.pendingActivity?.activityId;
    record.pendingActivity = pendingActivity;
    record.pendingNexusOperation = pendingNexusOperation;
    if (
      previousActivityId &&
      previousActivityId !== pendingActivity?.activityId
    ) {
      scheduledEventByActivityId.delete(previousActivityId);
    }
    if (pendingActivity) {
      scheduledEventByActivityId.set(pendingActivity.activityId, head);
    }
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

  function toWorkflowEvent(raw: HistoryEvent): WorkflowEvent {
    return toEvent(raw, {
      shouldNotAddBillableAction,
      processedWorkflowTaskIds,
      eventGroupLabels,
    });
  }

  function updateLatestEventTime(event: WorkflowEvent): void {
    const eventTimeMs = getValidTimeMs(event.eventTime);
    if (eventTimeMs === undefined) {
      return;
    }

    if (latestEventTimeMs !== undefined && eventTimeMs <= latestEventTimeMs) {
      return;
    }

    latestEventTimeMs = eventTimeMs;
  }

  // An event whose head is unknown (malformed attributes) heads its own group.
  function headSlotFor(event: WorkflowEvent, slot: number): number {
    const parsedHeadSlot =
      parseInt(getGroupId(event as CommonHistoryEvent)) - 1;
    return parsedHeadSlot >= 0 ? parsedHeadSlot : slot;
  }

  function indexEventGroups(
    event: WorkflowEvent,
    slot: number,
    record: GroupRecord,
  ): readonly EventGroupKey[] {
    if (!event.eventGroups) return NO_EVENT_GROUP_KEYS;
    const eventId = slot + 1;
    let linkedKeys: EventGroupKey[] | undefined;
    for (const group of event.eventGroups) {
      let entry = eventGroupIndex.get(group.key);
      if (!entry) {
        entry = {
          group,
          eventCount: 0,
          firstEventId: eventId,
          headSlots: new Set(),
          lifecycle: [],
          lifecycleSorted: true,
          lifecycleEventCount: 0,
          lifecycleVersion: 0,
          pendingCount: 0,
          initialEvent: undefined,
          lastEvent: undefined,
        };
        eventGroupIndex.set(group.key, entry);
      }
      entry.eventCount++;
      if (eventId < entry.firstEventId) entry.firstEventId = eventId;
      if (!entry.headSlots.has(record.headSlot)) {
        entry.headSlots.add(record.headSlot);
        (record.eventGroupKeys ??= []).push(group.key);
        (linkedKeys ??= []).push(group.key);
      }
    }
    return linkedKeys ?? NO_EVENT_GROUP_KEYS;
  }

  function addLifecycle(
    entry: EventGroupIndexEntry,
    record: GroupRecord,
  ): void {
    const last = entry.lifecycle[entry.lifecycle.length - 1];
    if (last && last.headSlot > record.headSlot) entry.lifecycleSorted = false;
    if (!last) timelineEventGroupCount++;
    entry.lifecycle.push(record);
  }

  function syncEventGroupTotals(
    record: GroupRecord,
    linkedKeys: readonly EventGroupKey[] = NO_EVENT_GROUP_KEYS,
  ): void {
    const keys = record.eventGroupKeys;
    if (!keys || !isTimelineLifecycle(record)) return;

    const eventCount = record.eventCount;
    const isPending = record.isPending;
    for (const key of keys) {
      const entry = eventGroupIndex.get(key);
      if (!entry) continue;

      if (!record.syncedVersion || linkedKeys.includes(key)) {
        addLifecycle(entry, record);
        entry.lifecycleEventCount += eventCount;
        entry.lifecycleVersion += record.version + 1;
        entry.pendingCount += Number(isPending);
        if (
          !entry.initialEvent ||
          Number(record.initialEvent.id) < Number(entry.initialEvent.id)
        ) {
          entry.initialEvent = record.initialEvent;
        }
      } else {
        entry.lifecycleEventCount += eventCount - record.syncedEventCount;
        entry.lifecycleVersion += record.version - record.syncedVersion;
        entry.pendingCount += Number(isPending) - Number(record.syncedPending);
      }
      if (isLaterEvent(record.lastEvent, entry.lastEvent)) {
        entry.lastEvent = record.lastEvent;
      }
      dirtyTimelineEventGroupKeys.add(key);
    }

    record.syncedVersion = record.version;
    record.syncedEventCount = eventCount;
    record.syncedPending = isPending;
  }

  function recordFor(headSlot: number): GroupRecord {
    const existing = headGroup[headSlot];
    if (existing !== 0) return records[existing - 1];

    const record = new GroupRecord(
      headSlot,
      applyPendingMetadataTo,
      materializeEventGroup,
    );
    records.push(record);
    headGroup[headSlot] = records.length;
    return record;
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
  function reset(historyLength: number): void {
    const size = Math.max(historyLength + 16, 16);

    events = new Array<null>(size).fill(null);
    headGroup = new Int32Array(size);
    records = [];
    enrichedRecords.clear();
    scheduledEventByActivityId.clear();
    pendingByActivityId = new Map();
    pendingByNexusScheduledId = new Map();
    maxSlot = -1;

    failedEvent = null;
    initialEvent = undefined;
    latestEventTimeMs = undefined;
    processedWorkflowTaskIds.clear();
    eventGroupLabels = createLabelRegistry();
    eventGroupIndex = new Map();
    cachedEventGroupOptions = null;
    timelineEventGroupsByKey = new Map();
    dirtyTimelineEventGroupKeys.clear();
    timelineEventGroupCount = 0;
    cachedTimelineEventGroups = null;

    revision++;
    cachedGroups = null;
    cachedGroupsNoWFT = null;
    cachedEvents = null;
    cachedLazyGroups = null;
    cachedLazyGroupsNoWFT = null;

    notifyChanged(true);
  }

  /**
   * The reset point past which events stop counting toward billableActions.
   * Currently unwired — no production caller supplies it.
   */
  function setFailedEvent(raw: HistoryEvent | null): void {
    failedEvent = raw;
  }

  /**
   * Add one raw HistoryEvent from either fetch cursor or the live poll.
   * Returns false when the event was already present.
   */
  function ingestHistoryEvent(raw: HistoryEvent): boolean {
    const slot = parseInt(raw.eventId) - 1;
    if (!(slot >= 0)) return false;

    grow(slot);
    if (events[slot]) return false;

    const event = toWorkflowEvent(raw);
    if (!initialEvent && isWorkflowExecutionStartedEvent(event)) {
      initialEvent = event;
    }
    events[slot] = event;
    if (slot > maxSlot) maxSlot = slot;

    const headSlot = headSlotFor(event, slot);
    grow(headSlot);

    const record = recordFor(headSlot);
    record.addMember(slot, event);
    syncEventGroupTotals(record, indexEventGroups(event, slot, record));
    updateLatestEventTime(event);
    revision++;

    notifyChanged();
    return true;
  }

  function getLatestEventTimeMs(): number | undefined {
    return latestEventTimeMs;
  }

  /**
   * Annotate activity and nexus groups with pending metadata from the workflow
   * run. Safe to call repeatedly — groups whose pending entry is unchanged keep
   * their existing reference.
   */
  function setPendingMetadata(
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
        syncEventGroupTotals(record);
        revision++;
        changed = true;
      }
    }

    if (changed) notifyChanged();
  }

  /**
   * The ActivityTaskScheduled event that started a currently-pending activity, or
   * undefined when that event has not been ingested yet. Only pending activities
   * are indexed: a resolved one drops out with its pending metadata.
   */
  function getPendingActivityScheduledEvent(
    activityId: string,
  ): WorkflowEvent | undefined {
    return scheduledEventByActivityId.get(activityId);
  }

  /**
   * Subscribe to buffer writes. Fires once per ingested event and once per
   * pending-metadata change, so subscribers are expected to coalesce. `immediate`
   * is true for reset, which subscribers should apply without coalescing so a
   * navigation cannot leave the previous run's groups on screen.
   * Returns an unsubscribe function.
   */
  function onChange(listener: ChangeListener): () => void {
    changeListeners.add(listener);
    return () => changeListeners.delete(listener);
  }

  /**
   * Sorted LazyGroup[] in ascending event-id order, without building a single
   * EventGroup. Cached until the next write; lazy groups are the records themselves,
   * so a rebuild allocates only the array.
   */
  function getLazyGroups(opts?: GroupArrayOptions): LazyGroup[] {
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
   * Sorted EventGroup[] in ascending event-id order — materializes every group.
   * Prefer getLazyGroups + materializeGroup so only rendered groups are built.
   */
  function getGroupArray(opts?: GroupArrayOptions): EventGroup[] {
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

  /** Every event group in the run, in order of the first event carrying it. */
  function getEventGroupOptions(): EventGroupOption[] {
    if (
      cachedEventGroupOptions &&
      cachedEventGroupOptionsRevision === revision
    ) {
      return cachedEventGroupOptions;
    }

    const result = [...eventGroupIndex.values()]
      .map(({ group, eventCount, firstEventId }) => ({
        group,
        eventCount,
        firstEventId,
      }))
      .sort((a, b) => a.firstEventId - b.firstEventId);

    cachedEventGroupOptions = result;
    cachedEventGroupOptionsRevision = revision;
    return result;
  }

  function hasTimelineEventGroups(): boolean {
    return timelineEventGroupCount > 0;
  }

  function getTimelineEventGroups(): TimelineEventGroup<LazyGroup>[] {
    if (
      cachedTimelineEventGroups &&
      (cachedTimelineEventGroupsRevision === revision ||
        !dirtyTimelineEventGroupKeys.size)
    ) {
      cachedTimelineEventGroupsRevision = revision;
      return cachedTimelineEventGroups;
    }

    for (const key of dirtyTimelineEventGroupKeys) {
      const entry = eventGroupIndex.get(key);
      if (!entry?.initialEvent || !entry.lastEvent) continue;
      const previous = timelineEventGroupsByKey.get(key);
      if (!entry.lifecycleSorted) {
        entry.lifecycle.sort((a, b) => a.headSlot - b.headSlot);
        entry.lifecycleSorted = true;
      }
      const lifecycleGroups: LazyGroup[] =
        previous?.lifecycleGroups.length !== entry.lifecycle.length
          ? entry.lifecycle.slice()
          : previous.lifecycleGroups;
      timelineEventGroupsByKey.set(
        key,
        toTimelineEventGroup(entry.group, lifecycleGroups, {
          initialEvent: entry.initialEvent,
          lastEvent: entry.lastEvent,
          eventCount: entry.lifecycleEventCount,
          isPending: entry.pendingCount > 0,
          version: entry.lifecycleVersion,
        }),
      );
    }
    dirtyTimelineEventGroupKeys.clear();

    const result = [...timelineEventGroupsByKey.values()].sort(
      (a, b) =>
        Number(a.initialEvent.id) - Number(b.initialEvent.id) ||
        a.key.localeCompare(b.key),
    );

    cachedTimelineEventGroups = result;
    cachedTimelineEventGroupsRevision = revision;
    return result;
  }

  /**
   * Matches lifecycle groups, and the events in them, that contain an event
   * carrying any of `keys`. Keys not in this run are ignored; returns undefined
   * when none remain, so a stale selection never hides the whole history.
   */
  function getEventGroupMatcher(
    keys: readonly EventGroupKey[],
  ): EventGroupMatcher | undefined {
    const headSlots = new Set<number>();
    for (const key of keys) {
      for (const headSlot of eventGroupIndex.get(key)?.headSlots ?? []) {
        headSlots.add(headSlot);
      }
    }
    if (!headSlots.size) return;

    return {
      hasGroup: (groupId) => headSlots.has(parseInt(groupId) - 1),
      hasEvent: (event) =>
        headSlots.has(headSlotFor(event, parseInt(event.id) - 1)),
    };
  }

  function getInitialEvent(): WorkflowExecutionStartedEvent | undefined {
    return initialEvent;
  }

  function getEvent(eventId: string): WorkflowEvent | undefined {
    const id = Number(eventId);
    if (!Number.isSafeInteger(id) || id < 1 || String(id) !== eventId) return;
    const event = events[id - 1];
    return event?.id === eventId ? event : undefined;
  }

  function getEventGroup(
    eventId: string,
    opts?: GroupArrayOptions,
  ): EventGroup | undefined {
    const event = getEvent(eventId);
    if (!event) return;
    const headSlot = headSlotFor(event, Number(eventId) - 1);
    const recordIndex = headGroup[headSlot];
    if (!recordIndex) return;
    const record = records[recordIndex - 1];
    if (!record.headsGroup) return;
    if (opts?.excludeWorkflowTasks && isWorkflowTaskGroup(record)) return;
    return materializeEventGroup(record) ?? undefined;
  }

  /** Flat WorkflowEvent[] in ascending event-id order. */
  function getEventArray(): WorkflowEvent[] {
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
  function getWorkflowTaskFailedEvent(): WorkflowEvent | undefined {
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

  return {
    reset,
    setFailedEvent,
    ingestHistoryEvent,
    setPendingMetadata,
    getPendingActivityScheduledEvent,
    onChange,
    getLazyGroups,
    getGroupArray,
    getEventGroupOptions,
    getTimelineEventGroups,
    hasTimelineEventGroups,
    getEventGroupMatcher,
    getLatestEventTimeMs,
    getEventArray,
    getEvent,
    getEventGroup,
    getInitialEvent,
    getWorkflowTaskFailedEvent,
  };
}

export type GroupedEventBuffer = ReturnType<typeof createGroupedEventBuffer>;
