import { readonly, writable } from 'svelte/store';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { EventGroupKey } from '$lib/models/event-history/event-group-markers';
import type { WorkflowEvent } from '$lib/types/events';
import { getSDKandVersion } from '$lib/utilities/get-sdk-version';
import {
  isResetEvent,
  isWorkflowTaskCompletedEvent,
} from '$lib/utilities/is-event-type';

import {
  type EventGroupMatcher,
  type EventGroupOption,
  type GroupedEventBuffer,
  type LazyGroup,
  materializeGroup,
} from './grouped-event-buffer';

/**
 * Reactive read surface over the grouped-event-buffer.
 *
 * The buffer knows nothing about Svelte; this wraps it so views read a value
 * instead of assembling their own subscribe / throttle / re-read effect. Writes
 * go through the buffer's own functions and notify this automatically, so
 * producers never announce their own changes.
 *
 * Updates coalesce onto a microtask: fetch pages and poll batches are ingested
 * in synchronous loops, so a batch becomes one update. Deliberately not
 * requestAnimationFrame — that never fires in a hidden tab, which would leave a
 * run opened in a background tab with an empty event history until focused.
 */
export class EventBufferView {
  private _version = $state(0);
  private pending = false;
  private disposed = false;
  private readonly buffer: GroupedEventBuffer;
  private readonly unsubscribe: () => void;
  private readonly writableVersionStore = writable(0);
  readonly versionStore = readonly(this.writableVersionStore);

  constructor(buffer: GroupedEventBuffer) {
    this.buffer = buffer;
    this.unsubscribe = buffer.onChange((immediate) =>
      this.scheduleUpdate(immediate),
    );
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.pending = false;
    this.unsubscribe();
  }

  private bump(): void {
    this.pending = false;
    this._version++;
    this.writableVersionStore.update((current) => current + 1);
  }

  private scheduleUpdate(immediate: boolean): void {
    if (this.disposed) return;
    if (immediate) {
      this.bump();
      return;
    }
    if (this.pending) return;
    this.pending = true;
    queueMicrotask(() => {
      if (!this.disposed && this.pending) this.bump();
    });
  }

  /** Bumped once per batch of buffer writes. */
  get version(): number {
    return this._version;
  }

  /**
   * Materialize a group, re-running whenever the buffer changes. A GroupRecord's
   * identity is stable for the life of the run, so a caller deriving off the
   * record alone would never see its contents change.
   */
  materializeGroup(group: LazyGroup): EventGroup {
    void this._version;
    return materializeGroup(group);
  }

  /**
   * The ActivityTaskScheduled event for a currently-pending activity. Reads
   * `_version` so callers re-derive once the head event lands.
   */
  pendingActivityScheduledEvent(activityId: string): WorkflowEvent | undefined {
    void this._version;
    return this.buffer.getPendingActivityScheduledEvent(activityId);
  }

  /**
   * Lazy groups with WorkflowTask groups filtered out — enough to filter,
   * sort and lay out, so callers materialize only what they render.
   */
  readonly lazyGroupsWithoutWorkflowTasks: LazyGroup[] = $derived.by(() => {
    void this._version;
    return this.buffer.getLazyGroups({ excludeWorkflowTasks: true });
  });

  /**
   * Fully materialized groups with WorkflowTask groups filtered out. Prefer
   * `lazyGroupsWithoutWorkflowTasks` — this builds every group in the history.
   */
  readonly groupsWithoutWorkflowTasks: EventGroup[] = $derived.by(() => {
    void this._version;
    return this.buffer.getGroupArray({ excludeWorkflowTasks: true });
  });

  /** Every event group in the run, in order of first appearance. */
  readonly eventGroupOptions: EventGroupOption[] = $derived.by(() => {
    void this._version;
    return this.buffer.getEventGroupOptions();
  });

  /**
   * Matcher for the selected event group keys, re-derived as events arrive.
   * Undefined when none of the keys exist in this run.
   */
  eventGroupMatcher(
    keys: readonly EventGroupKey[],
  ): EventGroupMatcher | undefined {
    void this._version;
    return this.buffer.getEventGroupMatcher(keys);
  }

  readonly events: WorkflowEvent[] = $derived.by(() => {
    void this._version;
    return this.buffer.getEventArray();
  });

  readonly initialEvent = $derived.by(() => {
    void this._version;
    return this.buffer.getInitialEvent();
  });

  readonly resetEvents = $derived(this.events.filter(isResetEvent));

  readonly sdkInfo = $derived(
    getSDKandVersion(this.events.filter(isWorkflowTaskCompletedEvent)),
  );

  /** The active WorkflowTaskFailed/TimedOut event, if the run has one. */
  readonly workflowTaskFailedEvent: WorkflowEvent | undefined = $derived.by(
    () => {
      void this._version;
      return this.buffer.getWorkflowTaskFailedEvent();
    },
  );
}

export type ExecutionHistory = Pick<
  EventBufferView,
  'events' | 'materializeGroup'
>;
