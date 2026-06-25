import type { Timeline } from './timeline.svelte';
import type { Viewport } from './viewport.svelte';

export interface ScaledSegment {
  key: string;
  startTimeMs: number;
  endTimeMs: number;
  startPx: number;
  endPx: number;
  isCollapsed: boolean;
  isCollapsible: boolean;
}

const DEFAULT_COLLAPSED_WIDTH_PX = 48;

export class TimelineScale {
  #timeline: Timeline;
  #viewport: Viewport;
  #getCollapsedPx: () => number;

  constructor(init: {
    timeline: Timeline;
    viewport: Viewport;
    getCollapsedPx?: () => number;
  }) {
    this.#timeline = init.timeline;
    this.#viewport = init.viewport;
    this.#getCollapsedPx =
      init.getCollapsedPx ?? (() => DEFAULT_COLLAPSED_WIDTH_PX);
  }

  readonly segments = $derived.by<ScaledSegment[]>(() =>
    buildScaledSegments({
      timeline: this.#timeline,
      widthPx: this.#viewport.widthPx,
      collapsedPx: this.#getCollapsedPx(),
    }),
  );

  project(timeMs: number): number {
    const segments = this.segments;
    if (!segments.length) {
      return 0;
    }

    const first = segments[0];
    const last = segments[segments.length - 1];

    if (timeMs <= first.startTimeMs) {
      return first.startPx;
    }

    if (timeMs >= last.endTimeMs) {
      return last.endPx;
    }

    for (const segment of segments) {
      if (timeMs > segment.endTimeMs) {
        continue;
      }

      const durationMs = segment.endTimeMs - segment.startTimeMs || 1;
      const ratio = (timeMs - segment.startTimeMs) / durationMs;
      return segment.startPx + ratio * (segment.endPx - segment.startPx);
    }

    return last.endPx;
  }

  unproject(px: number): number {
    const segments = this.segments;
    if (!segments.length) {
      return 0;
    }

    const first = segments[0];
    const last = segments[segments.length - 1];

    if (px <= first.startPx) {
      return first.startTimeMs;
    }

    if (px >= last.endPx) {
      return last.endTimeMs;
    }

    for (const segment of segments) {
      if (px > segment.endPx) {
        continue;
      }

      const widthPx = segment.endPx - segment.startPx || 1;
      const ratio = (px - segment.startPx) / widthPx;
      return (
        segment.startTimeMs + ratio * (segment.endTimeMs - segment.startTimeMs)
      );
    }

    return last.endTimeMs;
  }
}

function buildScaledSegments({
  timeline,
  widthPx,
  collapsedPx,
}: {
  timeline: Timeline;
  widthPx: number;
  collapsedPx: number;
}): ScaledSegment[] {
  const segments = timeline.segments;
  if (!segments.length) {
    return [];
  }

  let collapsedTotalPx = 0;
  let expandedDurationMs = 0;
  const collapsedBySegmentKey: Record<string, boolean> = {};

  for (const segment of segments) {
    const isCollapsed = timeline.isTimeSegmentCollapsed(segment);
    collapsedBySegmentKey[segment.timespan.key] = isCollapsed;

    if (isCollapsed) {
      collapsedTotalPx += collapsedPx;
    } else {
      expandedDurationMs += segment.timespan.durationMs;
    }
  }

  const availablePx = Math.max(widthPx - collapsedTotalPx, 0);

  const scaled: ScaledSegment[] = [];
  let cursorPx = 0;

  for (const segment of segments) {
    const isCollapsed = collapsedBySegmentKey[segment.timespan.key];

    const segmentWidthPx = isCollapsed
      ? collapsedPx
      : expandedDurationMs > 0
        ? (segment.timespan.durationMs / expandedDurationMs) * availablePx
        : 0;

    scaled.push({
      key: segment.timespan.key,
      startTimeMs: segment.timespan.startTimeMs,
      endTimeMs: segment.timespan.endTimeMs,
      startPx: cursorPx,
      endPx: cursorPx + segmentWidthPx,
      isCollapsed,
      isCollapsible: timeline.isTimeSegmentCollapsible(segment),
    });

    cursorPx += segmentWidthPx;
  }

  return scaled;
}
