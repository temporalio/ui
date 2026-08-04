import { readonly, writable } from 'svelte/store';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvent } from '$lib/types/events';

import {
  getEventArray,
  getGroupArray,
  getWorkflowTaskFailedEvent,
  onChange,
} from './grouped-event-buffer';

const versionStore = writable(0);

/**
 * Reactive read surface over the grouped-event-buffer.
 *
 * The buffer itself is a plain data structure: it stores events and derives
 * groups, but knows nothing about Svelte. This wraps it so views read a value
 * instead of assembling their own subscribe / throttle / re-read effect —
 * previously duplicated in both workflow layouts, and easy to get subtly wrong
 * (a missed re-read leaves the view showing stale groups).
 *
 * Writes still go through the buffer's own functions; they notify this view
 * automatically, so producers never announce their own changes.
 *
 * Updates are coalesced to one per animation frame. A fetch page delivers up to
 * 1000 events and the live poll arrives in batches, so without coalescing every
 * event would invalidate the derived reads.
 */
class EventBufferView {
  private _version = $state(0);
  private frame: number | null = null;

  constructor() {
    onChange((immediate) => this.scheduleUpdate(immediate));
  }

  private bump(): void {
    this._version++;
    versionStore.update((current) => current + 1);
  }

  private scheduleUpdate(immediate: boolean): void {
    if (immediate || typeof requestAnimationFrame !== 'function') {
      if (this.frame !== null) {
        cancelAnimationFrame(this.frame);
        this.frame = null;
      }
      this.bump();
      return;
    }
    if (this.frame !== null) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      this.bump();
    });
  }

  /** Bumped once per frame in which the buffer changed. */
  get version(): number {
    return this._version;
  }

  readonly groups: EventGroup[] = $derived.by(() => {
    void this._version;
    return getGroupArray();
  });

  /**
   * Groups with WorkflowTask groups filtered out — what both the timeline and
   * the compact history view render.
   */
  readonly groupsWithoutWorkflowTasks: EventGroup[] = $derived.by(() => {
    void this._version;
    return getGroupArray({ excludeWorkflowTasks: true });
  });

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
