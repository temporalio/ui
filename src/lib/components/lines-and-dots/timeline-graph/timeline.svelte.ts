import { SvelteSet } from 'svelte/reactivity';

import type { EventGroups } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvents } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
import { validTimeToDate } from '$lib/utilities/format-time';
import { isNotNullish } from '$lib/utilities/type-predicates';

import { buildTimeSegments } from './build-time-segments';
import { Timespan } from './timespan';
import type { TimeSegment, TimeSegmentKey } from './types';

const DEFAULT_DURATION_THRESHOLD_RATIO = 0.1;

interface TimelineInit {
  getFullEventHistory: () => WorkflowEvents;
  getWorkflow: () => WorkflowExecution;
  getEventGroups: () => EventGroups;
  getCurrentTimeMs: () => number;
  getDurationThresholdRatio?: () => number;
  getLoading?: () => boolean;
  getShouldCollapseByDefault?: () => boolean;
}

export class Timeline {
  private _collapsedSegmentKeys = new SvelteSet<TimeSegmentKey>();
  private _hasUserToggled = false;

  private _getFullEventHistory: () => WorkflowEvents;
  private _getWorkflow: () => WorkflowExecution;
  private _getEventGroups: () => EventGroups;
  private _getCurrentTimeMs: () => number;
  private _getDurationThresholdRatio: () => number;
  private _getLoading: () => boolean;
  private _getShouldCollapseByDefault: () => boolean;

  constructor({
    getFullEventHistory,
    getWorkflow,
    getEventGroups,
    getCurrentTimeMs,
    getDurationThresholdRatio,
    getLoading,
    getShouldCollapseByDefault,
  }: TimelineInit) {
    this._getFullEventHistory = getFullEventHistory;
    this._getWorkflow = getWorkflow;
    this._getEventGroups = getEventGroups;
    this._getCurrentTimeMs = getCurrentTimeMs;
    this._getDurationThresholdRatio =
      getDurationThresholdRatio ?? (() => DEFAULT_DURATION_THRESHOLD_RATIO);
    this._getLoading = getLoading ?? (() => false);
    this._getShouldCollapseByDefault =
      getShouldCollapseByDefault ?? (() => false);

    // Finalize once the fetch completes: releasing the freeze (see `segments`)
    // builds the real segment set, and collapsing the idle gaps by default is
    // the same lifecycle moment — both key off the loading→done transition.
    // While loading, `segments` is a single span so this is a no-op anyway.
    $effect(() => {
      if (!this._getLoading() && this._getShouldCollapseByDefault()) {
        this.collapseAllSegmentsByDefault();
      }
    });
  }

  readonly workflow = $derived.by(() => this._getWorkflow());
  readonly eventGroups = $derived.by(() => this._getEventGroups());
  private readonly _endUnbounded = $derived(!this.workflow.endTime);

  private readonly _endMs = $derived.by(() => {
    // `||` not `??`: a running workflow's endTime is often an empty string, not
    // null — fall back to "now" so validTimeToDate doesn't throw on "".
    const end = this.workflow.endTime || this._getCurrentTimeMs();
    return validTimeToDate(end).getTime();
  });

  private readonly _startMs = $derived.by(() => {
    // History is ascending by time, so the earliest event is the first entry.
    const firstEventTime = this._getFullEventHistory()[0]?.eventTime;

    const startCandidates = [
      firstEventTime,
      this.workflow.executionTime,
    ].filter(isNotNullish);

    const earliestStartTime = startCandidates.length
      ? Math.min(
          ...startCandidates.map((time) => validTimeToDate(time).getTime()),
        )
      : undefined;

    const start =
      (isWorkflowDelayed(this.workflow) && this.workflow.startTime
        ? this.workflow.startTime
        : earliestStartTime) ??
      this.workflow.startTime ??
      this._endMs;

    return Math.min(validTimeToDate(start).getTime(), this._endMs);
  });

  // Primitive-number deriveds above so the Timespan (and everything downstream)
  // only rebuilds when a boundary actually changes, not on every streamed event.
  readonly workflowTimespan = $derived.by(
    () =>
      new Timespan(this._startMs, this._endMs, {
        endUnbounded: this._endUnbounded,
      }),
  );

  readonly segments = $derived.by<TimeSegment[]>(() => {
    // While history is still streaming, the event-derived gaps shift on every
    // page, which reprojects every already-placed event and forces a full-canvas
    // repaint each frame. Hold a single linear span until the fetch completes,
    // then build the real segmented scale once (one reflow instead of ~1/page).
    if (this._getLoading()) {
      return [{ kind: 'active', timespan: this.workflowTimespan }];
    }
    return buildTimeSegments({
      workflowTimespan: this.workflowTimespan,
      eventGroups: this.eventGroups,
    });
  });

  // Raw set membership (not isTimeSegmentCollapsed): the guarded check reads this
  // value so it'd be circular, and using raw membership keeps the denominator
  // stable so expanding one gap can't cascade borderline gaps open.
  readonly expandedDurationMs = $derived.by(() =>
    this.segments.reduce(
      (sum, segment) =>
        this._isSegmentCollapsedRaw(segment)
          ? sum
          : sum + segment.timespan.durationMs,
      0,
    ),
  );

  private _isSegmentCollapsedRaw(segment: TimeSegment): boolean {
    return this._collapsedSegmentKeys.has(segment.timespan.key);
  }

  isTimeSegmentCollapsible(segment: TimeSegment): boolean {
    if (segment.kind !== 'inactive') return false;
    if (this.segments.length <= 1) return false;
    if (this.expandedDurationMs <= 0) return false;

    return (
      segment.timespan.durationMs / this.expandedDurationMs >=
      this._getDurationThresholdRatio()
    );
  }

  isTimeSegmentCollapsed(segment: TimeSegment): boolean {
    return (
      this._isSegmentCollapsedRaw(segment) &&
      this.isTimeSegmentCollapsible(segment)
    );
  }

  readonly collapsibleSegments = $derived(
    this.segments.filter((segment) => this.isTimeSegmentCollapsible(segment)),
  );

  readonly hasCollapsibleSegments = $derived(
    this.collapsibleSegments.length > 0,
  );

  readonly allCollapsibleSegmentsCollapsed = $derived(
    this.hasCollapsibleSegments &&
      this.collapsibleSegments.every((segment) =>
        this.isTimeSegmentCollapsed(segment),
      ),
  );

  toggleTimeSegment(segment: TimeSegment): void {
    this._hasUserToggled = true;
    const key = segment.timespan.key;
    if (this._collapsedSegmentKeys.has(key)) {
      this._collapsedSegmentKeys.delete(key);
    } else {
      this._collapsedSegmentKeys.add(key);
    }
  }

  expandAllSegments(): void {
    this._hasUserToggled = true;
    this._collapsedSegmentKeys.clear();
  }

  collapseAllSegments(): void {
    this._hasUserToggled = true;
    this._collapseAllSegments();
  }

  collapseAllSegmentsByDefault(): void {
    if (this._hasUserToggled) return;
    this._collapseAllSegments();
  }

  private _collapseAllSegments(): void {
    // Doesn't set _hasUserToggled — only public methods do.
    // Loops because collapsing shrinks expandedDurationMs, which can push more
    // segments past the threshold.
    let collapsed = true;
    while (collapsed) {
      collapsed = false;
      for (const segment of this.segments) {
        const key = segment.timespan.key;
        if (this._collapsedSegmentKeys.has(key)) continue;
        if (this.isTimeSegmentCollapsible(segment)) {
          this._collapsedSegmentKeys.add(key);
          collapsed = true;
        }
      }
    }
  }
}
