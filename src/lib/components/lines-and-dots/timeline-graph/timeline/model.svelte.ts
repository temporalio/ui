import { SvelteSet } from 'svelte/reactivity';

import type { EventGroups } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvents } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { isNotNullish } from '$lib/utilities/array';
import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
import { minDate } from '$lib/utilities/format-time';

import { Timespan } from '../timespan';
import { buildTimeSegments } from './build-time-segments';
import type { TimeSegment, TimeSegmentKey } from './types';

const DEFAULT_DURATION_THRESHOLD_RATIO = 0.2;

interface TimelineInit {
  getFullEventHistory: () => WorkflowEvents;
  getWorkflow: () => WorkflowExecution;
  getEventGroups: () => EventGroups;
  getCurrentTimeMs: () => number;
  getDurationThresholdRatio?: () => number;
}

export class Timeline {
  #collapsedTimeSegmentKeys = new SvelteSet<string>();

  #getFullEventHistory: () => WorkflowEvents;
  #getWorkflow: () => WorkflowExecution;
  #getEventGroups: () => EventGroups;
  #getCurrentTimeMs: () => number;
  // #getDurationThresholdRatio: () => number;

  constructor({
    getFullEventHistory,
    getWorkflow,
    getEventGroups,
    getCurrentTimeMs,
    getDurationThresholdRatio,
  }: TimelineInit) {
    this.#getFullEventHistory = getFullEventHistory;
    this.#getWorkflow = getWorkflow;
    this.#getEventGroups = getEventGroups;
    this.#getCurrentTimeMs = getCurrentTimeMs;
    this.#getDurationThresholdRatio =
      getDurationThresholdRatio ?? (() => DEFAULT_DURATION_THRESHOLD_RATIO);
  }

  readonly workflow = $derived.by(() => this.#getWorkflow());
  readonly eventGroups = $derived.by(() => this.#getEventGroups());
  readonly workflowTimespan = $derived.by(() => {
    const fullEventHistory = this.#getFullEventHistory();

    const earliestStartTime = minDate(
      ...[
        ...fullEventHistory
          .map((wfEvent) => wfEvent?.eventTime)
          .filter(isNotNullish),
        this.workflow.executionTime,
      ],
    );

    return Timespan.coerce({
      start:
        isWorkflowDelayed(this.workflow) && this.workflow.startTime
          ? this.workflow.startTime
          : earliestStartTime,
      end: this.workflow.endTime ?? this.#getCurrentTimeMs(),
    });
  });

  readonly segments = $derived.by<TimeSegment[]>(() => {
    return buildTimeSegments({
      workflowTimespan: this.workflowTimespan,
      eventGroups: this.eventGroups,
    });
  });

  isTimeSegmentCollapsed(segmentKey: TimeSegmentKey): boolean {
    return this.#collapsedTimeSegmentKeys.has(segmentKey);
  }

  toggleTimeSegment(segmentKey: TimeSegmentKey): void {
    this.#collapsedTimeSegmentKeys.has(segmentKey);
  }
}
