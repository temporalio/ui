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
import type {
  CommonHistoryEvent,
  EventTypeCategory,
  HistoryEvent,
  PendingActivity,
  PendingNexusOperation,
  WorkflowEvent,
} from '$lib/types/events';
import { formatDate } from '$lib/utilities/format-date';
import { validTimeToDate } from '$lib/utilities/format-time';
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
  readonly startTimeMs?: number;
  readonly lastTimeMs?: number;
  readonly initialEvent: WorkflowEvent;
  readonly lastEvent: WorkflowEvent;
  readonly category: WorkflowEvent['category'];
  readonly classification: WorkflowEvent['classification'];
  readonly finalClassification: WorkflowEvent['classification'];
  readonly isPending: boolean;
  readonly pendingActivity: PendingActivity | undefined;
  readonly pendingNexusOperation: PendingNexusOperation | undefined;
  readonly eventPoints?: readonly LazyTimelineEventPoint[];
  readonly activityStartedTimeMs?: number;
  readonly activityAttempt?: number;
  readonly childWorkflow?: LazyChildWorkflowReference;
  readonly timelineDisplayName?: string;
  readonly timelinePrefix?: string;
  readonly timelineCategory?: EventTypeCategory;
}

export type LazyTimelineEventPoint = {
  eventId: number;
  timeMs: number;
  classification: WorkflowEvent['classification'];
};

export type LazyChildWorkflowReference = {
  namespace?: string;
  workflowId: string;
  runId: string;
};

export type ChangeListener = (immediate: boolean) => void;

export type GroupArrayOptions = {
  excludeWorkflowTasks?: boolean;
};

const lazyGroupRecords = new WeakSet<object>();

/**
 * Distinguishes a lazy group from an already-materialized EventGroup or a plain
 * event, for views handed a mix of the two.
 */
export function isLazyGroup(value: unknown): value is LazyGroup {
  return (
    typeof value === 'object' && value !== null && lazyGroupRecords.has(value)
  );
}

export type GroupedEventBufferOptions = {
  formatTimestamps?: boolean;
};

export function createGroupedEventBuffer({
  formatTimestamps = true,
}: GroupedEventBufferOptions = {}) {
  const eventTimeMs = (event: WorkflowEvent): number => {
    const value = event.eventTime;
    if (!value) return 0;
    if (typeof value === 'string') return Date.parse(value) || 0;
    if (typeof value === 'number') return value;
    return validTimeToDate(value).getTime();
  };

  const prepareForMaterialization = (event: WorkflowEvent): WorkflowEvent => {
    if (!formatTimestamps && !event.timestamp) {
      event.timestamp = formatDate(event.eventTime);
    }
    return event;
  };

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
    private pointsVersion = -1;
    private cachedPoints: readonly LazyTimelineEventPoint[] = [];
    activityStartedTimeMs: number | undefined;
    activityAttempt: number | undefined;
    childWorkflow: LazyChildWorkflowReference | undefined;
    startTimeMs = 0;
    lastTimeMs = 0;
    private childNamespace: string | undefined;

    constructor(readonly headSlot: number) {
      this.id = String(headSlot + 1);
      lazyGroupRecords.add(this);
    }

    addMember(slot: number, event: WorkflowEvent): void {
      this.slots.push(slot);
      if (slot > this.lastSlot) {
        this.lastSlot = slot;
        this.lastEvent = event;
        this.lastTimeMs = eventTimeMs(event);
      }
      if (isTerminalActivityEvent(event)) this.hasTerminalActivity = true;
      if (isTerminalNexusEvent(event)) this.hasTerminalNexus = true;
      this.captureTimelineFields(event);
      if (slot === this.headSlot) {
        this.initialEvent = event;
        this.startTimeMs = eventTimeMs(event);
        this.category = groupCategory(event);
        this.headsGroup = isGroupHeadEvent(event as CommonHistoryEvent);
      }
      // A head arriving picks pending metadata up; a terminal event drops it.
      applyPendingMetadataTo(this);
      this.version++;
    }

    private captureTimelineFields(event: WorkflowEvent): void {
      const eventAttributes = event.attributes as Record<string, unknown>;
      if (event.eventType === 'ActivityTaskStarted') {
        this.activityStartedTimeMs = event.eventTime
          ? validTimeToDate(event.eventTime).getTime()
          : undefined;
        const attempt = Number(eventAttributes.attempt);
        this.activityAttempt = Number.isFinite(attempt) ? attempt : undefined;
      }
      if (event.eventType === 'StartChildWorkflowExecutionInitiated') {
        const namespace = eventAttributes.namespace;
        if (typeof namespace === 'string' && namespace) {
          this.childNamespace = namespace;
          if (this.childWorkflow && !this.childWorkflow.namespace) {
            this.childWorkflow = { ...this.childWorkflow, namespace };
          }
        }
      }
      if (event.eventType !== 'ChildWorkflowExecutionStarted') return;
      const execution = eventAttributes.workflowExecution;
      if (!execution || typeof execution !== 'object') return;
      const { workflowId, runId } = execution as Record<string, unknown>;
      if (
        typeof workflowId !== 'string' ||
        !workflowId ||
        typeof runId !== 'string' ||
        !runId
      ) {
        return;
      }
      const namespace = eventAttributes.namespace;
      this.childWorkflow = {
        namespace:
          typeof namespace === 'string' && namespace
            ? namespace
            : this.childNamespace,
        workflowId,
        runId,
      };
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

    get eventPoints(): readonly LazyTimelineEventPoint[] {
      if (this.pointsVersion === this.version) return this.cachedPoints;
      const points: LazyTimelineEventPoint[] = [];
      for (const slot of this.slots) {
        const event = events[slot];
        if (!event) continue;
        points.push({
          eventId: Number(event.id),
          timeMs: eventTimeMs(event),
          classification: event.classification,
        });
      }
      points.sort((left, right) => left.eventId - right.eventId);
      this.cachedPoints = points;
      this.pointsVersion = this.version;
      return points;
    }
  }

  // ---------------------------------------------------------------------------
  // Module state (reset between workflows via reset())
  // ---------------------------------------------------------------------------

  let events: (WorkflowEvent | null)[] = [];
  let headGroup = new Int32Array(0); // head slot -> record index + 1 (0 = none)
  let records: GroupRecord[] = [];
  let maxSlot = -1;
  let minSlot = Number.POSITIVE_INFINITY;

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
      formatTimestamp: formatTimestamps,
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
  function materializeEventGroup(
    record: GroupRecord,
    formatForDisplay = true,
  ): EventGroup | null {
    if (formatForDisplay && record.cachedVersion === record.version) {
      return record.cached;
    }
    if (formatForDisplay) {
      record.cachedVersion = record.version;
      record.cached = null;
    }

    const head = events[record.headSlot];
    if (!head) return null;
    const prepare = formatForDisplay
      ? prepareForMaterialization
      : (event: WorkflowEvent) => event;

    const group =
      createEventGroup(prepare(head) as CommonHistoryEvent) ??
      createWorkflowTaskGroup(prepare(head) as CommonHistoryEvent);
    if (!group) return null;

    const followers: WorkflowEvent[] = [];
    for (const slot of record.slots) {
      if (slot === record.headSlot) continue;
      const event = events[slot];
      if (event) followers.push(prepare(event));
    }
    followers.sort((a, b) => Number(a.id) - Number(b.id));

    for (const event of followers) {
      group.eventList.push(event);
      group.timestamp = event.timestamp;
      addEventToGroup(group, event);
    }

    applyPendingMetadata(group, record);

    if (formatForDisplay) record.cached = group;
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
    minSlot = Number.POSITIVE_INFINITY;

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
    events[slot] = event;
    if (slot > maxSlot) maxSlot = slot;
    if (slot < minSlot) minSlot = slot;

    // An event whose head is unknown (malformed attributes) heads its own group.
    const parsedHeadSlot =
      parseInt(getGroupId(event as CommonHistoryEvent)) - 1;
    const headSlot = parsedHeadSlot >= 0 ? parsedHeadSlot : slot;
    grow(headSlot);

    recordFor(headSlot).addMember(slot, event);
    revision++;

    notifyChanged();
    return true;
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
        revision++;
        changed = true;
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
  function onChange(listener: ChangeListener): () => void {
    changeListeners.add(listener);
    return () => changeListeners.delete(listener);
  }

  function isWorkflowTaskGroup(group: EventGroup | LazyGroup): boolean {
    return group.initialEvent.eventType === 'WorkflowTaskScheduled';
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
   * The full EventGroup for a lazy group, memoized on its content version: an
   * unchanged lazy group returns the identical object, a changed one a new object.
   *
   * Idempotent — an already-materialized EventGroup passes straight through, so
   * views can accept either lazy groups or groups built elsewhere (e.g.
   * groupEvents() in graph-widget) without branching at every use site.
   */
  function materializeGroup(lazy: LazyGroup): EventGroup {
    if (lazy instanceof GroupRecord) {
      return materializeEventGroup(lazy) as EventGroup;
    }
    return lazy as unknown as EventGroup;
  }

  /**
   * Builds an uncached immutable-model snapshot without formatting display
   * timestamps. Sealing may touch hundreds of thousands of groups; timestamp
   * strings are added lazily when details are actually opened.
   */
  function snapshotGroup(lazy: LazyGroup): EventGroup {
    if (lazy instanceof GroupRecord) {
      return materializeEventGroup(lazy, false) as EventGroup;
    }
    return lazy as unknown as EventGroup;
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

  /** Flat WorkflowEvent[] in ascending event-id order. */
  function getEventArray(): WorkflowEvent[] {
    if (cachedEvents && cachedEventsRevision === revision) return cachedEvents;

    const result: WorkflowEvent[] = [];
    for (let slot = 0; slot <= maxSlot; slot++) {
      const event = events[slot];
      if (event) result.push(prepareForMaterialization(event));
    }

    cachedEvents = result;
    cachedEventsRevision = revision;
    return result;
  }

  function getFirstEvent(): WorkflowEvent | undefined {
    return Number.isFinite(minSlot)
      ? (events[minSlot] ?? undefined)
      : undefined;
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

  return {
    getEventArray,
    getFirstEvent,
    getGroupArray,
    getLazyGroups,
    getPendingActivityScheduledEvent,
    getWorkflowTaskFailedEvent,
    ingestHistoryEvent,
    isWorkflowTaskGroup,
    materializeGroup,
    onChange,
    reset,
    setFailedEvent,
    setPendingMetadata,
    snapshotGroup,
  };
}

export type GroupedEventBuffer = ReturnType<typeof createGroupedEventBuffer>;

export class ActiveBufferHandle {
  current: GroupedEventBuffer;
  version = 0;

  private readonly listeners = new Set<ChangeListener>();
  private unsubscribe: () => void;

  constructor(buffer = createGroupedEventBuffer()) {
    this.current = buffer;
    this.unsubscribe = buffer.onChange((immediate) => this.notify(immediate));
  }

  replace(buffer: GroupedEventBuffer): void {
    this.unsubscribe();
    this.current = buffer;
    this.unsubscribe = buffer.onChange((immediate) => this.notify(immediate));
    this.version += 1;
    this.notify(true);
  }

  onChange(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(immediate: boolean): void {
    for (const listener of this.listeners) listener(immediate);
  }
}

export const activeBufferHandle = new ActiveBufferHandle();

export const replaceActiveBuffer = (buffer: GroupedEventBuffer): void =>
  activeBufferHandle.replace(buffer);

export const getEventArray = (): WorkflowEvent[] =>
  activeBufferHandle.current.getEventArray();
export const getFirstEvent = (): WorkflowEvent | undefined =>
  activeBufferHandle.current.getFirstEvent();
export const getGroupArray = (opts?: GroupArrayOptions): EventGroup[] =>
  activeBufferHandle.current.getGroupArray(opts);
export const getLazyGroups = (opts?: GroupArrayOptions): LazyGroup[] =>
  activeBufferHandle.current.getLazyGroups(opts);
export const getPendingActivityScheduledEvent = (
  activityId: string,
): WorkflowEvent | undefined =>
  activeBufferHandle.current.getPendingActivityScheduledEvent(activityId);
export const getWorkflowTaskFailedEvent = (): WorkflowEvent | undefined =>
  activeBufferHandle.current.getWorkflowTaskFailedEvent();
export const ingestHistoryEvent = (raw: HistoryEvent): boolean =>
  activeBufferHandle.current.ingestHistoryEvent(raw);
export const isWorkflowTaskGroup = (group: EventGroup | LazyGroup): boolean =>
  activeBufferHandle.current.isWorkflowTaskGroup(group);
export const materializeGroup = (lazy: LazyGroup): EventGroup =>
  activeBufferHandle.current.materializeGroup(lazy);
export const onChange = (listener: ChangeListener): (() => void) =>
  activeBufferHandle.onChange(listener);
export const reset = (historyLength: number): void =>
  activeBufferHandle.current.reset(historyLength);
export const setFailedEvent = (raw: HistoryEvent | null): void =>
  activeBufferHandle.current.setFailedEvent(raw);
export const setPendingMetadata = (
  pendingActivities: PendingActivity[],
  pendingNexusOperations: PendingNexusOperation[],
): void =>
  activeBufferHandle.current.setPendingMetadata(
    pendingActivities,
    pendingNexusOperations,
  );

export const appendLiveEvent = ingestHistoryEvent;
export const enrichGroups = setPendingMetadata;
export const processEvent = (
  raw: HistoryEvent,
  _isAscending?: boolean,
): boolean => ingestHistoryEvent(raw);
