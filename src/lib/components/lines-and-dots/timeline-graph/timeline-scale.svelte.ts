import { SvelteSet } from 'svelte/reactivity';

import type { EventGroups } from '$lib/models/event-groups/event-groups';

import type { ViewportModel } from './viewport/model.svelte';

interface Segment {
  startTimeMs: number;
  endTimeMs: number;
  startPx: number;
  endPx: number;
  isCollapsed: boolean;
}

const DEFAULT_THRESHOLD_PERCENT = 0.2;
const DEFAULT_COLLAPSED_WIDTH_PX = 24;

export class TimelineScale {
  #viewport: ViewportModel;
  #getEventGroups: () => EventGroups;
  #getThreshold: () => number;
  #getCollapsedPx: () => number;
  #collapsedSegments: SvelteSet<string>;

  constructor(init: {
    viewport: ViewportModel;
    getEventGroups: () => EventGroups;
    getThreshold?: () => number;
    getCollapsedPx?: () => number;
    collapsedSegments: SvelteSet<string>;
  }) {
    this.#viewport = init.viewport;
    this.#getEventGroups = init.getEventGroups;
    this.#getThreshold = init.getThreshold ?? (() => DEFAULT_THRESHOLD_PERCENT);
    this.#getCollapsedPx =
      init.getCollapsedPx ?? (() => DEFAULT_COLLAPSED_WIDTH_PX);
    this.#collapsedSegments = init.collapsedSegments;
  }

  readonly segments = $derived.by(() =>
    buildSegments({
      viewport: this.#viewport,
      eventGroups: this.#getEventGroups(),
      threshold: this.#getThreshold(),
      collapsedPx: this.#getCollapsedPx(),
      collapsedSegments: this.#collapsedSegments,
    }),
  );

  project(timeMs: number): number {}
}

function buildSegments(params: {
  viewport: ViewportModel;
  eventGroups: EventGroups;
  threshold: number;
  collapsedPx: number;
  collapsedSegments: SvelteSet<string>;
}): Segment[] {
  return [];
}
