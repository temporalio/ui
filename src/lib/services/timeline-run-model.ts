import type { ChildWorkflowReference } from '$lib/components/lines-and-dots/timeline-graph/recursive-timeline-model';
import { restoreEventGroup } from '$lib/models/event-groups/create-event-group';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import {
  getEventGroupDisplayName,
  getEventGroupLabel,
} from '$lib/models/event-groups/get-group-name';
import { resolveSystemNexusEvent } from '$lib/system-nexus-endpoints';
import type {
  EventClassification,
  EventTypeCategory,
  WorkflowEvent,
} from '$lib/types/events';
import { formatDate } from '$lib/utilities/format-date';
import { validTimeToDate } from '$lib/utilities/format-time';
import { isActivityTaskScheduledEvent } from '$lib/utilities/is-event-type';

import type { GroupedEventBuffer, LazyGroup } from './grouped-event-buffer';
import type { WorkflowChainOverviewRun } from './workflow-chain-overview';

export type TimelineEventPoint = {
  eventId: number;
  timestampMs: number;
  classification: EventClassification;
};

export type TimelineRowPresentation = {
  displayName: string;
  prefix: string;
  initialEventType: WorkflowEvent['eventType'];
  activityStartedTimeMs?: number;
  retryAttempt: number;
  retried: boolean;
  scheduling: boolean;
  timelineCategory: EventTypeCategory | 'retry' | 'pending';
  pendingAttempt?: number;
  pendingMaximumAttempts?: number;
  pendingPaused: boolean;
  pendingPauseTimeMs?: number;
};

export type TimelineGroupSummary = {
  key: string;
  version: number;
  initialEventId: number;
  finalEventId: number;
  startTimeMs: number;
  endTimeMs: number;
  category: EventTypeCategory;
  classification: EventClassification;
  finalClassification: EventClassification;
  eventCount: number;
  points: readonly TimelineEventPoint[];
  row: TimelineRowPresentation;
  pending: boolean;
  childWorkflow?: ChildWorkflowReference;
};

export interface TimelineRunModel {
  readonly run: WorkflowChainOverviewRun;
  readonly revision: number;
  readonly groupCount: number;
  readonly sealed: boolean;
  readonly statistics?: TimelineRunModelStatistics;
  readonly topologyOrdinals?: readonly number[];
  readonly activeTimeRanges?: readonly TimelineActiveTimeRange[];
  groupAt(ordinal: number): TimelineGroupSummary | undefined;
  groups(startOrdinal: number, endOrdinal: number): TimelineGroupSummary[];
  presentationGroups(): readonly LazyGroup[];
  materializePresentationGroup(group: LazyGroup): EventGroup;
  loadDetails(key: string, expectedVersion: number): Promise<EventGroup>;
  retain(): () => void;
  dispose(): void;
}

export type TimelineActiveTimeRange = Readonly<{
  startTimeMs: number;
  endTimeMs: number;
}>;

export type CompleteHistoryIdentity = Readonly<{
  namespace: string;
  workflowId: string;
  runId: string;
  closeTimeMs: number;
  historyLength: number;
}>;

export type TimelineRunModelStatistics = {
  eventCount: number;
  estimatedBytes: number;
};

export class StaleTimelineGroupError extends Error {
  constructor() {
    super('The timeline group changed before its details were loaded.');
    this.name = 'StaleTimelineGroupError';
  }
}

type DetailCacheEntry = {
  group: EventGroup;
  bytes: number;
  live: boolean;
  runKey: string;
  pins: number;
};

const estimateStringBytes = (value: string): number =>
  new TextEncoder().encode(value).byteLength;

export const estimateTimelineGroupBytes = (
  summary: TimelineGroupSummary,
): number => {
  let bytes = 64;
  bytes += estimateStringBytes(summary.key);
  bytes += estimateStringBytes(summary.row.displayName);
  bytes += estimateStringBytes(summary.row.prefix);
  bytes += summary.points.length * 24;
  if (summary.childWorkflow) {
    bytes += estimateStringBytes(summary.childWorkflow.namespace);
    bytes += estimateStringBytes(summary.childWorkflow.workflowId);
    bytes += estimateStringBytes(summary.childWorkflow.runId);
  }
  return bytes;
};

const estimateDetailBytes = (group: EventGroup): number => {
  let bytes = 64;
  for (const event of group.eventList) {
    bytes +=
      64 + estimateStringBytes(event.eventType) + estimateStringBytes(event.id);
    try {
      bytes += estimateStringBytes(JSON.stringify(event.attributes));
    } catch {
      bytes += 64;
    }
  }
  return bytes;
};

export class TimelineDetailCache {
  private readonly entries = new Map<string, DetailCacheEntry>();
  private totalBytes = 0;

  constructor(readonly maximumBytes: number) {}

  get bytes(): number {
    return this.totalBytes;
  }

  get size(): number {
    return this.entries.size;
  }

  get(key: string): EventGroup | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.group;
  }

  set(
    key: string,
    group: EventGroup,
    { live, runKey }: { live: boolean; runKey: string },
  ): void {
    this.delete(key);
    const entry = {
      group,
      bytes: estimateDetailBytes(group),
      live,
      runKey,
      pins: 0,
    };
    this.entries.set(key, entry);
    this.totalBytes += entry.bytes;
    this.evict();
  }

  pin(key: string): () => void {
    const entry = this.entries.get(key);
    if (!entry) return () => undefined;
    entry.pins += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      entry.pins = Math.max(0, entry.pins - 1);
      this.evict();
    };
  }

  invalidateLiveRun(runKey: string): void {
    for (const [key, entry] of this.entries) {
      if (entry.live && entry.runKey === runKey) this.delete(key);
    }
  }

  clear(): void {
    this.entries.clear();
    this.totalBytes = 0;
  }

  private delete(key: string): void {
    const entry = this.entries.get(key);
    if (!entry) return;
    this.entries.delete(key);
    this.totalBytes -= entry.bytes;
  }

  private evict(): void {
    if (this.totalBytes <= this.maximumBytes) return;
    for (const [key, entry] of this.entries) {
      if (entry.pins > 0) continue;
      this.delete(key);
      if (this.totalBytes <= this.maximumBytes) return;
    }
  }
}

const eventTimeMs = (event: WorkflowEvent): number =>
  event.eventTime ? validTimeToDate(event.eventTime).getTime() : 0;

const toRowPresentation = (lazy: LazyGroup): TimelineRowPresentation => {
  const pendingActivity = lazy.pendingActivity;
  const pauseTime = pendingActivity?.pauseInfo?.pauseTime;
  const retryAttempt = lazy.activityAttempt ?? 0;
  return {
    displayName:
      lazy.timelineDisplayName ??
      getEventGroupDisplayName(lazy.initialEvent as never),
    prefix: isActivityTaskScheduledEvent(lazy.initialEvent)
      ? (lazy.timelineDisplayName ??
        getEventGroupDisplayName(lazy.initialEvent as never))
      : (lazy.timelinePrefix ?? getEventGroupLabel(lazy.initialEvent as never)),
    initialEventType: lazy.initialEvent.eventType,
    activityStartedTimeMs: lazy.activityStartedTimeMs,
    retryAttempt,
    retried: retryAttempt > 1,
    scheduling: lazy.finalClassification === 'Completed',
    timelineCategory:
      lazy.timelineCategory ??
      resolveSystemNexusEvent(lazy.initialEvent)?.timelineCategory ??
      lazy.category,
    pendingAttempt: pendingActivity?.attempt ?? undefined,
    pendingMaximumAttempts: pendingActivity?.maximumAttempts ?? undefined,
    pendingPaused: Boolean(pendingActivity?.paused),
    pendingPauseTimeMs: pauseTime
      ? validTimeToDate(pauseTime).getTime()
      : undefined,
  };
};

const toSummary = (
  lazy: LazyGroup,
  currentNamespace: string,
): TimelineGroupSummary => {
  const child = lazy.childWorkflow;
  return {
    key: lazy.id,
    version: lazy.version ?? 0,
    initialEventId: Number(lazy.initialEvent.id),
    finalEventId: Number(lazy.lastEvent.id),
    startTimeMs: eventTimeMs(lazy.initialEvent),
    endTimeMs: eventTimeMs(lazy.lastEvent),
    category: lazy.category,
    classification: lazy.classification,
    finalClassification: lazy.finalClassification,
    eventCount: lazy.eventCount,
    points: (
      lazy.eventPoints ?? [
        {
          eventId: Number(lazy.initialEvent.id),
          timeMs: eventTimeMs(lazy.initialEvent),
          classification: lazy.initialEvent.classification,
        },
      ]
    ).map((point) => ({
      eventId: point.eventId,
      timestampMs: point.timeMs,
      classification: point.classification,
    })),
    row: toRowPresentation(lazy),
    pending: lazy.isPending,
    childWorkflow: child
      ? {
          namespace: child.namespace ?? currentNamespace,
          workflowId: child.workflowId,
          runId: child.runId,
        }
      : undefined,
  };
};

export class BufferTimelineRunModel implements TimelineRunModel {
  private buffer: GroupedEventBuffer | null;
  private _revision = 0;
  private leases = 0;
  private disposed = false;
  private readonly unsubscribe: () => void;
  private readonly summaryCache = new Map<
    number,
    { version: number; summary: TimelineGroupSummary }
  >();

  constructor(
    readonly run: WorkflowChainOverviewRun,
    private readonly namespace: string,
    private readonly workflowId: string,
    buffer: GroupedEventBuffer,
    private readonly detailCache: TimelineDetailCache,
  ) {
    this.buffer = buffer;
    this.unsubscribe = buffer.onChange(() => {
      this._revision += 1;
    });
  }

  get revision(): number {
    return this._revision;
  }

  readonly sealed = false;

  get groupCount(): number {
    return this.lazyGroups().length;
  }

  presentationGroups(): readonly LazyGroup[] {
    return this.lazyGroups();
  }

  materializePresentationGroup(group: LazyGroup): EventGroup {
    return this.materializeSource(group);
  }

  get statistics(): TimelineRunModelStatistics {
    const runtimeStringBytes = (value: string): number => value.length * 2;
    let eventCount = 0;
    let estimatedBytes = 0;
    for (const group of this.lazyGroups()) {
      eventCount += group.eventCount;
      // Cache accounting only needs a stable, conservative approximation. Do
      // not build TimelineGroupSummary objects just to measure their strings.
      estimatedBytes +=
        64 +
        runtimeStringBytes(group.id) +
        runtimeStringBytes(group.initialEvent.eventType) * 2 +
        group.eventCount * 24;
      if (group.childWorkflow) {
        estimatedBytes += runtimeStringBytes(
          group.childWorkflow.namespace ?? this.namespace,
        );
        estimatedBytes += runtimeStringBytes(group.childWorkflow.workflowId);
        estimatedBytes += runtimeStringBytes(group.childWorkflow.runId);
      }
    }
    return { eventCount, estimatedBytes };
  }

  private materializeSource(group: EventGroup | LazyGroup): EventGroup {
    if ('eventList' in group) return group;
    const version = group.version ?? 0;
    const cacheKey = this.detailKey(group.id, version);
    const cached = this.detailCache.get(cacheKey);
    if (cached) return cached;
    const materialized = this.requireBuffer().materializeGroup(group);
    this.detailCache.set(cacheKey, materialized, {
      live: this.run.status === 'Running' || this.run.status === 'Paused',
      runKey: this.runKey,
    });
    return materialized;
  }

  groupAt(ordinal: number): TimelineGroupSummary | undefined {
    const lazy = this.lazyGroups()[ordinal];
    if (!lazy) return undefined;
    const version = lazy.version ?? 0;
    const cached = this.summaryCache.get(ordinal);
    if (cached?.version === version) return cached.summary;
    const summary = toSummary(lazy, this.namespace);
    this.summaryCache.set(ordinal, { version, summary });
    return summary;
  }

  groups(startOrdinal: number, endOrdinal: number): TimelineGroupSummary[] {
    const start = Math.max(0, startOrdinal);
    const end = Math.min(this.groupCount, Math.max(start, endOrdinal));
    const groups: TimelineGroupSummary[] = [];
    for (let ordinal = start; ordinal < end; ordinal += 1) {
      const group = this.groupAt(ordinal);
      if (group) groups.push(group);
    }
    return groups;
  }

  async loadDetails(key: string, expectedVersion: number): Promise<EventGroup> {
    const buffer = this.requireBuffer();
    const cacheKey = this.detailKey(key, expectedVersion);
    const cached = this.detailCache.get(cacheKey);
    if (cached) return cached;
    const lazy = buffer
      .getLazyGroups({ excludeWorkflowTasks: true })
      .find((candidate) => candidate.id === key);
    if (!lazy || (lazy.version ?? 0) !== expectedVersion) {
      throw new StaleTimelineGroupError();
    }
    const group = this.materializeSource(lazy);
    if ((lazy.version ?? 0) !== expectedVersion) {
      throw new StaleTimelineGroupError();
    }
    return group;
  }

  retain(): () => void {
    if (this.disposed)
      throw new Error('Cannot retain a disposed timeline model.');
    this.leases += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.leases = Math.max(0, this.leases - 1);
      if (this.leases === 0) this.releaseBuffer();
    };
  }

  dispose(): void {
    if (this.leases > 0) return;
    this.releaseBuffer();
  }

  private releaseBuffer(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe();
    this.detailCache.invalidateLiveRun(this.runKey);
    this.summaryCache.clear();
    this.buffer?.reset(0);
    this.buffer = null;
  }

  private lazyGroups(): LazyGroup[] {
    return this.requireBuffer().getLazyGroups({ excludeWorkflowTasks: true });
  }

  private requireBuffer(): GroupedEventBuffer {
    if (!this.buffer || this.disposed) {
      throw new Error('The timeline run model has been disposed.');
    }
    return this.buffer;
  }

  private get runKey(): string {
    return `${this.namespace}:${this.workflowId}:${this.run.runId}`;
  }

  private detailKey(key: string, version: number): string {
    return `${this.runKey}:${key}:${version}`;
  }
}

const deepFreeze = <T>(value: T): T => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const estimateSealedPresentationBytes = (
  group: LazyGroup,
  row: TimelineRowPresentation,
): number =>
  group.id.length * 2 +
  group.initialEvent.eventType.length * 2 +
  row.displayName.length * 2 +
  row.prefix.length * 2 +
  group.eventCount * 24 +
  160;

const prepareDetailsForDisplay = (group: EventGroup): EventGroup => {
  for (const event of group.eventList) {
    if (!event.timestamp) event.timestamp = formatDate(event.eventTime);
  }
  if (!group.timestamp) {
    group.timestamp = group.eventList.at(-1)?.timestamp ?? '';
  }
  return group;
};

const appendActiveTimeRange = (
  ranges: { startTimeMs: number; endTimeMs: number }[],
  group: LazyGroup,
  pendingEndTimeMs: number,
): void => {
  if (group.initialEvent === group.lastEvent && !group.isPending) return;
  const startTimeMs = group.startTimeMs ?? eventTimeMs(group.initialEvent);
  const endTimeMs = group.isPending
    ? pendingEndTimeMs
    : (group.lastTimeMs ?? eventTimeMs(group.lastEvent));
  if (endTimeMs <= startTimeMs) return;
  const previous = ranges.at(-1);
  if (previous && startTimeMs <= previous.endTimeMs) {
    previous.endTimeMs = Math.max(previous.endTimeMs, endTimeMs);
  } else {
    ranges.push({ startTimeMs, endTimeMs });
  }
};

/** Columnar immutable render backing. Only the bounded chunk LRU gets objects. */
class SealedPresentationStore {
  private keys: string[];
  private versions: Uint32Array;
  private eventCounts: Uint32Array;
  private startTimes: Float64Array;
  private endTimes: Float64Array;
  private initialEventIds: Float64Array;
  private finalEventIds: Float64Array;
  private initialEventTypes: WorkflowEvent['eventType'][];
  private finalEventTypes: WorkflowEvent['eventType'][];
  private categories: LazyGroup['category'][];
  private classifications: LazyGroup['classification'][];
  private finalClassifications: LazyGroup['finalClassification'][];
  private displayNames: string[];
  private prefixes: string[];
  private timelineCategories: EventTypeCategory[];
  private pending: Uint8Array;
  private readonly eventPoints = new Map<number, LazyGroup['eventPoints']>();
  private readonly pendingActivities = new Map<
    number,
    LazyGroup['pendingActivity']
  >();
  private readonly pendingNexusOperations = new Map<
    number,
    LazyGroup['pendingNexusOperation']
  >();
  private readonly activityStartedTimes = new Map<number, number>();
  private readonly activityAttempts = new Map<number, number>();
  private readonly childWorkflows = new Map<
    number,
    NonNullable<LazyGroup['childWorkflow']>
  >();
  private readonly cache = new Map<number, LazyGroup>();
  readonly groups: readonly LazyGroup[];

  constructor(readonly length: number) {
    this.keys = new Array(length);
    this.versions = new Uint32Array(length);
    this.eventCounts = new Uint32Array(length);
    this.startTimes = new Float64Array(length);
    this.endTimes = new Float64Array(length);
    this.initialEventIds = new Float64Array(length);
    this.finalEventIds = new Float64Array(length);
    this.initialEventTypes = new Array(length);
    this.finalEventTypes = new Array(length);
    this.categories = new Array(length);
    this.classifications = new Array(length);
    this.finalClassifications = new Array(length);
    this.displayNames = new Array(length);
    this.prefixes = new Array(length);
    this.timelineCategories = new Array(length);
    this.pending = new Uint8Array(length);
    const target = new Array<LazyGroup>(length);
    const ordinalFor = (property: PropertyKey): number | undefined => {
      if (typeof property !== 'string' || !/^\d+$/.test(property)) {
        return undefined;
      }
      const ordinal = Number(property);
      return Number.isSafeInteger(ordinal) ? ordinal : undefined;
    };
    this.groups = new Proxy(target, {
      get: (array, property, receiver) => {
        const ordinal = ordinalFor(property);
        return ordinal === undefined
          ? Reflect.get(array, property, receiver)
          : this.groupAt(ordinal);
      },
      has: (array, property) => {
        const ordinal = ordinalFor(property);
        return ordinal === undefined
          ? Reflect.has(array, property)
          : ordinal >= 0 && ordinal < this.length;
      },
    });
  }

  capture(
    ordinal: number,
    group: LazyGroup,
    row: TimelineRowPresentation,
  ): void {
    this.keys[ordinal] = group.id;
    this.versions[ordinal] = group.version ?? 0;
    this.eventCounts[ordinal] = group.eventCount;
    this.startTimes[ordinal] =
      group.startTimeMs ?? eventTimeMs(group.initialEvent);
    this.endTimes[ordinal] = group.lastTimeMs ?? eventTimeMs(group.lastEvent);
    this.initialEventIds[ordinal] = Number(group.initialEvent.id);
    this.finalEventIds[ordinal] = Number(group.lastEvent.id);
    this.initialEventTypes[ordinal] = group.initialEvent.eventType;
    this.finalEventTypes[ordinal] = group.lastEvent.eventType;
    this.categories[ordinal] = group.category;
    this.classifications[ordinal] = group.classification;
    this.finalClassifications[ordinal] = group.finalClassification;
    this.displayNames[ordinal] = row.displayName;
    this.prefixes[ordinal] = row.prefix;
    this.timelineCategories[ordinal] =
      row.timelineCategory as EventTypeCategory;
    this.pending[ordinal] = Number(group.isPending);
    if (group.eventCount > 1 && group.eventPoints) {
      this.eventPoints.set(
        ordinal,
        Object.freeze(
          group.eventPoints.map((point) => Object.freeze({ ...point })),
        ),
      );
    }
    if (group.pendingActivity) {
      this.pendingActivities.set(
        ordinal,
        deepFreeze({ ...group.pendingActivity }),
      );
    }
    if (group.pendingNexusOperation) {
      this.pendingNexusOperations.set(
        ordinal,
        deepFreeze({ ...group.pendingNexusOperation }),
      );
    }
    if (group.activityStartedTimeMs !== undefined) {
      this.activityStartedTimes.set(ordinal, group.activityStartedTimeMs);
    }
    if (group.activityAttempt !== undefined) {
      this.activityAttempts.set(ordinal, group.activityAttempt);
    }
    if (group.childWorkflow) {
      this.childWorkflows.set(
        ordinal,
        Object.freeze({ ...group.childWorkflow }),
      );
    }
  }

  groupAt(ordinal: number): LazyGroup | undefined {
    if (ordinal < 0 || ordinal >= this.length || !this.keys[ordinal]) {
      return undefined;
    }
    const cached = this.cache.get(ordinal);
    if (cached) {
      this.cache.delete(ordinal);
      this.cache.set(ordinal, cached);
      return cached;
    }
    const event = (
      id: number,
      timeMs: number,
      eventType: WorkflowEvent['eventType'],
      category: LazyGroup['category'],
      classification: LazyGroup['classification'],
    ): WorkflowEvent =>
      Object.freeze({
        id: String(id),
        eventTime: new Date(timeMs).toISOString(),
        eventType,
        category,
        classification,
        attributes: {},
      }) as unknown as WorkflowEvent;
    const initialEvent = event(
      this.initialEventIds[ordinal],
      this.startTimes[ordinal],
      this.initialEventTypes[ordinal],
      this.categories[ordinal],
      this.classifications[ordinal],
    );
    const lastEvent =
      this.finalEventIds[ordinal] === this.initialEventIds[ordinal]
        ? initialEvent
        : event(
            this.finalEventIds[ordinal],
            this.endTimes[ordinal],
            this.finalEventTypes[ordinal],
            this.categories[ordinal],
            this.finalClassifications[ordinal],
          );
    const group = Object.freeze({
      id: this.keys[ordinal],
      version: this.versions[ordinal],
      eventCount: this.eventCounts[ordinal],
      startTimeMs: this.startTimes[ordinal],
      lastTimeMs: this.endTimes[ordinal],
      initialEvent,
      lastEvent,
      category: this.categories[ordinal],
      classification: this.classifications[ordinal],
      finalClassification: this.finalClassifications[ordinal],
      isPending: Boolean(this.pending[ordinal]),
      pendingActivity: this.pendingActivities.get(ordinal),
      pendingNexusOperation: this.pendingNexusOperations.get(ordinal),
      eventPoints: this.eventPoints.get(ordinal),
      activityStartedTimeMs: this.activityStartedTimes.get(ordinal),
      activityAttempt: this.activityAttempts.get(ordinal),
      childWorkflow: this.childWorkflows.get(ordinal),
      timelineDisplayName: this.displayNames[ordinal],
      timelinePrefix: this.prefixes[ordinal],
      timelineCategory: this.timelineCategories[ordinal],
    }) as LazyGroup;
    this.cache.set(ordinal, group);
    if (this.cache.size > 4_096) {
      this.cache.delete(this.cache.keys().next().value!);
    }
    return group;
  }

  ordinalForKey(key: string): number | undefined {
    const eventId = Number(key);
    if (!Number.isFinite(eventId)) return undefined;
    let low = 0;
    let high = this.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (this.initialEventIds[middle] < eventId) low = middle + 1;
      else high = middle;
    }
    return low < this.length && this.keys[low] === key ? low : undefined;
  }

  clear(): void {
    this.cache.clear();
    this.keys = [];
    this.versions = new Uint32Array(0);
    this.eventCounts = new Uint32Array(0);
    this.startTimes = new Float64Array(0);
    this.endTimes = new Float64Array(0);
    this.initialEventIds = new Float64Array(0);
    this.finalEventIds = new Float64Array(0);
    this.initialEventTypes = [];
    this.finalEventTypes = [];
    this.categories = [];
    this.classifications = [];
    this.finalClassifications = [];
    this.displayNames = [];
    this.prefixes = [];
    this.timelineCategories = [];
    this.pending = new Uint8Array(0);
    this.eventPoints.clear();
    this.pendingActivities.clear();
    this.pendingNexusOperations.clear();
    this.activityStartedTimes.clear();
    this.activityAttempts.clear();
    this.childWorkflows.clear();
  }
}

type PackedDetailBacking = {
  bytes: Uint8Array;
  offsets: Uint32Array;
};

const packDetailBacking = (details: readonly string[]): PackedDetailBacking => {
  if (details.length === 0) {
    return { bytes: new Uint8Array(0), offsets: new Uint32Array(1) };
  }
  const bytes = new TextEncoder().encode(details.join('\n'));
  const offsets = new Uint32Array(details.length + 1);
  let ordinal = 1;
  for (
    let offset = 0;
    offset < bytes.length && ordinal < details.length;
    offset++
  ) {
    if (bytes[offset] === 0x0a) offsets[ordinal++] = offset + 1;
  }
  offsets[details.length] = bytes.length + 1;
  return { bytes, offsets };
};

const detailDecoder = new TextDecoder();

const detailAt = (backing: PackedDetailBacking, ordinal: number): string => {
  const start = backing.offsets[ordinal];
  const end = Math.min(backing.bytes.length, backing.offsets[ordinal + 1] - 1);
  return detailDecoder.decode(backing.bytes.subarray(start, end));
};

export class SealedTimelineRunModel implements TimelineRunModel {
  readonly sealed = true;
  readonly revision = 0;
  readonly groupCount: number;
  readonly statistics: TimelineRunModelStatistics;
  readonly topologyOrdinals: readonly number[];
  readonly activeTimeRanges: readonly TimelineActiveTimeRange[];
  private leases = 0;
  private disposed = false;
  private summaries: (TimelineGroupSummary | undefined)[];
  private presentation: readonly LazyGroup[];
  private readonly presentationStore: SealedPresentationStore;
  private detailBacking: PackedDetailBacking | null;
  private readonly detailCache: TimelineDetailCache;

  private constructor(
    readonly identity: CompleteHistoryIdentity,
    readonly run: WorkflowChainOverviewRun,
    summaries: (TimelineGroupSummary | undefined)[],
    presentationStore: SealedPresentationStore,
    detailBacking: PackedDetailBacking,
    detailCache: TimelineDetailCache,
    statistics: TimelineRunModelStatistics,
    topologyOrdinals: readonly number[],
    activeTimeRanges: readonly TimelineActiveTimeRange[],
  ) {
    this.summaries = summaries;
    this.presentationStore = presentationStore;
    this.presentation = presentationStore.groups;
    this.detailBacking = detailBacking;
    this.detailCache = detailCache;
    this.groupCount = presentationStore.length;
    this.statistics = statistics;
    this.topologyOrdinals = topologyOrdinals;
    this.activeTimeRanges = activeTimeRanges;
  }

  static fromBuffer({
    identity,
    run,
    namespace: _namespace,
    buffer,
    detailCache,
  }: {
    identity: CompleteHistoryIdentity;
    run: WorkflowChainOverviewRun;
    namespace: string;
    buffer: GroupedEventBuffer;
    detailCache: TimelineDetailCache;
  }): SealedTimelineRunModel {
    const groups = buffer.getLazyGroups({ excludeWorkflowTasks: true });
    const summaries = new Array<TimelineGroupSummary | undefined>(
      groups.length,
    );
    const presentationStore = new SealedPresentationStore(groups.length);
    const detailBacking: string[] = [];
    const topologyOrdinals: number[] = [];
    const activeTimeRanges: { startTimeMs: number; endTimeMs: number }[] = [];
    let eventCount = 0;
    let estimatedBytes = 0;
    for (let ordinal = 0; ordinal < groups.length; ordinal += 1) {
      const group = groups[ordinal];
      const detail = buffer.snapshotGroup(group);
      const backing = JSON.stringify(detail);
      const row = toRowPresentation(group);
      presentationStore.capture(ordinal, group, row);
      detailBacking.push(backing);
      if (group.category === 'child-workflow') topologyOrdinals.push(ordinal);
      appendActiveTimeRange(activeTimeRanges, group, run.endTimeMs);
      eventCount += group.eventCount;
      estimatedBytes += estimateSealedPresentationBytes(group, row);
    }
    const packedDetails = packDetailBacking(detailBacking);
    estimatedBytes +=
      packedDetails.bytes.byteLength + packedDetails.offsets.byteLength;
    const model = new SealedTimelineRunModel(
      deepFreeze({ ...identity }),
      deepFreeze({ ...run }),
      summaries,
      presentationStore,
      packedDetails,
      detailCache,
      { eventCount, estimatedBytes },
      Object.freeze(topologyOrdinals),
      deepFreeze(activeTimeRanges),
    );
    buffer.reset(0);
    return model;
  }

  static async fromBufferCooperatively({
    identity,
    run,
    namespace: _namespace,
    buffer,
    detailCache,
    signal,
  }: {
    identity: CompleteHistoryIdentity;
    run: WorkflowChainOverviewRun;
    namespace: string;
    buffer: GroupedEventBuffer;
    detailCache: TimelineDetailCache;
    signal?: AbortSignal;
  }): Promise<SealedTimelineRunModel> {
    const groups = buffer.getLazyGroups({ excludeWorkflowTasks: true });
    const summaries = new Array<TimelineGroupSummary | undefined>(
      groups.length,
    );
    const presentationStore = new SealedPresentationStore(groups.length);
    const detailBacking: string[] = [];
    const topologyOrdinals: number[] = [];
    const activeTimeRanges: { startTimeMs: number; endTimeMs: number }[] = [];
    let eventCount = 0;
    let estimatedBytes = 0;
    let sliceStartedAt = performance.now();
    for (let ordinal = 0; ordinal < groups.length; ordinal += 1) {
      const group = groups[ordinal];
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const detail = buffer.snapshotGroup(group);
      const backing = JSON.stringify(detail);
      const row = toRowPresentation(group);
      presentationStore.capture(ordinal, group, row);
      detailBacking.push(backing);
      if (group.category === 'child-workflow') topologyOrdinals.push(ordinal);
      appendActiveTimeRange(activeTimeRanges, group, run.endTimeMs);
      eventCount += group.eventCount;
      estimatedBytes += estimateSealedPresentationBytes(group, row);
      if (performance.now() - sliceStartedAt < 8) continue;
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      sliceStartedAt = performance.now();
    }
    const packedDetails = packDetailBacking(detailBacking);
    estimatedBytes +=
      packedDetails.bytes.byteLength + packedDetails.offsets.byteLength;
    const model = new SealedTimelineRunModel(
      deepFreeze({ ...identity }),
      deepFreeze({ ...run }),
      summaries,
      presentationStore,
      packedDetails,
      detailCache,
      { eventCount, estimatedBytes },
      Object.freeze(topologyOrdinals),
      deepFreeze(activeTimeRanges),
    );
    buffer.reset(0);
    return model;
  }

  groupAt(ordinal: number): TimelineGroupSummary | undefined {
    this.requireAvailable();
    const cached = this.summaries[ordinal];
    if (cached) return cached;
    const group = this.presentation[ordinal];
    if (!group) return undefined;
    const summary = deepFreeze(toSummary(group, this.identity.namespace));
    this.summaries[ordinal] = summary;
    return summary;
  }

  groups(startOrdinal: number, endOrdinal: number): TimelineGroupSummary[] {
    this.requireAvailable();
    const groups: TimelineGroupSummary[] = [];
    const start = Math.max(0, startOrdinal);
    const end = Math.min(this.groupCount, Math.max(startOrdinal, endOrdinal));
    for (let ordinal = start; ordinal < end; ordinal += 1) {
      const summary = this.groupAt(ordinal);
      if (summary) groups.push(summary);
    }
    return groups;
  }

  presentationGroups(): readonly LazyGroup[] {
    this.requireAvailable();
    return this.presentation;
  }

  materializePresentationGroup(group: LazyGroup): EventGroup {
    const version = group.version ?? 0;
    const cacheKey = this.detailKey(group.id, version);
    const cached = this.detailCache.get(cacheKey);
    if (cached) return cached;
    const ordinal = this.presentationStore.ordinalForKey(group.id);
    if (
      ordinal === undefined ||
      (this.presentation[ordinal]?.version ?? 0) !== version
    ) {
      throw new StaleTimelineGroupError();
    }
    const detail = deepFreeze(
      prepareDetailsForDisplay(
        restoreEventGroup(
          JSON.parse(
            detailAt(this.requireDetailBacking(), ordinal),
          ) as EventGroup,
        ),
      ),
    );
    this.detailCache.set(cacheKey, detail, {
      live: false,
      runKey: this.identity.runId,
    });
    return detail;
  }

  async loadDetails(key: string, expectedVersion: number): Promise<EventGroup> {
    const ordinal = this.presentationStore.ordinalForKey(key);
    const group =
      ordinal === undefined ? undefined : this.presentation[ordinal];
    if (!group || (group.version ?? 0) !== expectedVersion) {
      throw new StaleTimelineGroupError();
    }
    return this.materializePresentationGroup(group);
  }

  retain(): () => void {
    this.requireAvailable();
    this.leases += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.leases = Math.max(0, this.leases - 1);
      if (this.leases === 0) this.releaseBacking();
    };
  }

  dispose(): void {
    if (this.leases === 0) this.releaseBacking();
  }

  private releaseBacking(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.summaries = [];
    this.presentation = [];
    this.presentationStore.clear();
    this.detailBacking = null;
  }

  private requireAvailable(): void {
    if (this.disposed) {
      throw new Error('The timeline run model has been disposed.');
    }
  }

  private requireDetailBacking(): PackedDetailBacking {
    this.requireAvailable();
    if (!this.detailBacking) {
      throw new Error('The timeline detail backing has been disposed.');
    }
    return this.detailBacking;
  }

  private detailKey(key: string, version: number): string {
    const identity = this.identity;
    return `${identity.namespace.length}:${identity.namespace}:${identity.workflowId.length}:${identity.workflowId}:${identity.runId.length}:${identity.runId}:${key}:${version}`;
  }
}

export const estimateTimelineModelBytes = (model: TimelineRunModel): number => {
  let bytes = 0;
  for (let ordinal = 0; ordinal < model.groupCount; ordinal += 1) {
    const summary = model.groupAt(ordinal);
    if (summary) bytes += estimateTimelineGroupBytes(summary);
  }
  return bytes;
};

export class TimelineRunModelCache {
  private readonly entries = new Map<
    number,
    {
      identity: CompleteHistoryIdentity;
      model: SealedTimelineRunModel;
      bytes: number;
      release: () => void;
    }
  >();
  private totalBytes = 0;
  private nextEntryId = 0;
  readonly counters = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(
    readonly maximumEntries: number,
    readonly maximumBytes: number,
  ) {}

  get size(): number {
    return this.entries.size;
  }

  get bytes(): number {
    return this.totalBytes;
  }

  get(identity: CompleteHistoryIdentity): SealedTimelineRunModel | undefined {
    for (const [entryId, entry] of this.entries) {
      if (!sameCompleteHistoryIdentity(entry.identity, identity)) continue;
      this.entries.delete(entryId);
      this.entries.set(entryId, entry);
      this.counters.hits += 1;
      return entry.model;
    }
    this.counters.misses += 1;
    return undefined;
  }

  invalidateRunSnapshot(identity: CompleteHistoryIdentity): void {
    for (const [entryId, entry] of [...this.entries]) {
      if (
        entry.identity.namespace !== identity.namespace ||
        entry.identity.workflowId !== identity.workflowId ||
        entry.identity.runId !== identity.runId ||
        sameCompleteHistoryIdentity(entry.identity, identity)
      ) {
        continue;
      }
      this.deleteEntry(entryId, entry);
    }
  }

  set(
    identity: CompleteHistoryIdentity,
    model: SealedTimelineRunModel,
    bytes: number,
  ): boolean {
    if (!model.sealed) {
      throw new Error(
        'Only sealed timeline models can enter the session cache.',
      );
    }
    this.delete(identity);
    if (this.maximumEntries < 1 || bytes > this.maximumBytes) return false;
    const entry = {
      identity: deepFreeze({ ...identity }),
      model,
      bytes,
      release: model.retain(),
    };
    this.entries.set(++this.nextEntryId, entry);
    this.totalBytes += bytes;
    this.evict();
    return true;
  }

  delete(identity: CompleteHistoryIdentity): void {
    for (const [entryId, entry] of this.entries) {
      if (!sameCompleteHistoryIdentity(entry.identity, identity)) continue;
      this.deleteEntry(entryId, entry);
      return;
    }
  }

  clear(): void {
    for (const [entryId, entry] of [...this.entries]) {
      this.deleteEntry(entryId, entry);
    }
  }

  private evict(): void {
    while (
      this.entries.size > this.maximumEntries ||
      this.totalBytes > this.maximumBytes
    ) {
      const oldest = this.entries.entries().next().value as
        | [
            number,
            {
              identity: CompleteHistoryIdentity;
              model: SealedTimelineRunModel;
              bytes: number;
              release: () => void;
            },
          ]
        | undefined;
      if (!oldest) return;
      this.deleteEntry(...oldest);
      this.counters.evictions += 1;
    }
  }

  private deleteEntry(
    entryId: number,
    entry: {
      bytes: number;
      release: () => void;
    },
  ): void {
    this.entries.delete(entryId);
    this.totalBytes -= entry.bytes;
    entry.release();
  }
}

export const sameCompleteHistoryIdentity = (
  left: CompleteHistoryIdentity,
  right: CompleteHistoryIdentity,
): boolean =>
  left.namespace === right.namespace &&
  left.workflowId === right.workflowId &&
  left.runId === right.runId &&
  left.closeTimeMs === right.closeTimeMs &&
  left.historyLength === right.historyLength;

export type TimelineModelSession = {
  detailCache: TimelineDetailCache;
  modelCache: TimelineRunModelCache;
};

let timelineModelSession: TimelineModelSession | undefined;

export const getTimelineModelSession = ({
  maximumEntries,
  maximumModelBytes,
  maximumDetailBytes,
}: {
  maximumEntries: number;
  maximumModelBytes: number;
  maximumDetailBytes: number;
}): TimelineModelSession => {
  timelineModelSession ??= {
    detailCache: new TimelineDetailCache(maximumDetailBytes),
    modelCache: new TimelineRunModelCache(maximumEntries, maximumModelBytes),
  };
  return timelineModelSession;
};

export const clearTimelineModelSession = (): void => {
  timelineModelSession?.modelCache.clear();
  timelineModelSession?.detailCache.clear();
  timelineModelSession = undefined;
};
