import { readonly, writable } from 'svelte/store';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvent } from '$lib/types/events';

import {
  type EventGroupMatcher,
  type EventGroupOption,
  getEventArray,
  getEventGroupMatcher,
  getEventGroupOptions,
  getGroupArray,
  getLazyGroups,
  getPendingActivityScheduledEvent,
  getWorkflowTaskFailedEvent,
  type LazyGroup,
  materializeGroup,
  onChange,
} from './grouped-event-buffer';

const versionStore = writable(0);

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
class EventBufferView {
  private _version = $state(0);
  private pending = false;

  constructor() {
    onChange((immediate) => this.scheduleUpdate(immediate));
  }

  private bump(): void {
    this.pending = false;
    this._version++;
    versionStore.update((current) => current + 1);
  }

  private scheduleUpdate(immediate: boolean): void {
    if (immediate) {
      this.bump();
      return;
    }
    if (this.pending) return;
    this.pending = true;
    queueMicrotask(() => {
      if (this.pending) this.bump();
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
    return getPendingActivityScheduledEvent(activityId);
  }

  /**
   * Lazy groups with WorkflowTask groups filtered out — enough to filter,
   * sort and lay out, so callers materialize only what they render.
   */
  readonly lazyGroupsWithoutWorkflowTasks: LazyGroup[] = $derived.by(() => {
    void this._version;
    return getLazyGroups({ excludeWorkflowTasks: true });
  });

  /**
   * Fully materialized groups with WorkflowTask groups filtered out. Prefer
   * `lazyGroupsWithoutWorkflowTasks` — this builds every group in the history.
   */
  readonly groupsWithoutWorkflowTasks: EventGroup[] = $derived.by(() => {
    void this._version;
    return getGroupArray({ excludeWorkflowTasks: true });
  });

  /** Every event group in the run, in order of first appearance. */
  readonly eventGroupOptions: EventGroupOption[] = $derived.by(() => {
    void this._version;
    return getEventGroupOptions();
  });

  /**
   * Matcher for the selected event group keys, re-derived as events arrive.
   * Undefined when none of the keys exist in this run.
   */
  eventGroupMatcher(keys: readonly string[]): EventGroupMatcher | undefined {
    void this._version;
    return getEventGroupMatcher(keys);
  }

  readonly events: WorkflowEvent[] = $derived.by(() => {
    void this._version;
    return getEventArray();
  });

  /** The active WorkflowTaskFailed/TimedOut event, if the run has one. */
  readonly workflowTaskFailedEvent: WorkflowEvent | undefined = $derived.by(
    () => {
      void this._version;
      return getWorkflowTaskFailedEvent();
    },
  );
}

export const eventBuffer = new EventBufferView();

/**
 * Store mirror of `eventBuffer.version`, for the derived stores in
 * $lib/stores/events that predate runes. Prefer `eventBuffer` in new code.
 */
export const bufferVersion = readonly(versionStore);
