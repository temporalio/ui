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
  private _timeline: Timeline;
  private _viewport: Viewport;
  private _getCollapsedPx: () => number;

  constructor(init: {
    timeline: Timeline;
    viewport: Viewport;
    getCollapsedPx?: () => number;
  }) {
    this._timeline = init.timeline;
    this._viewport = init.viewport;
    this._getCollapsedPx =
      init.getCollapsedPx ?? (() => DEFAULT_COLLAPSED_WIDTH_PX);
  }

  readonly segments = $derived.by<ScaledSegment[]>(() =>
    buildScaledSegments({
      timeline: this._timeline,
      widthPx: this._viewport.widthPx,
      collapsedPx: this._getCollapsedPx(),
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

    // Binary search (segments are contiguous + time-sorted); project runs per
    // event point on every mounting row.
    const segment =
      segments[firstIndexReaching(segments, (seg) => seg.endTimeMs, timeMs)];
    const durationMs = segment.endTimeMs - segment.startTimeMs || 1;
    const ratio = (timeMs - segment.startTimeMs) / durationMs;
    return segment.startPx + ratio * (segment.endPx - segment.startPx);
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

    const segment =
      segments[firstIndexReaching(segments, (seg) => seg.endPx, px)];
    const widthPx = segment.endPx - segment.startPx || 1;
    const ratio = (px - segment.startPx) / widthPx;
    return (
      segment.startTimeMs + ratio * (segment.endTimeMs - segment.startTimeMs)
    );
  }
}

// First index whose accessor value is >= target. Assumes the accessor is
// non-decreasing across segments (true for both endTimeMs and endPx).
function firstIndexReaching(
  segments: ScaledSegment[],
  end: (segment: ScaledSegment) => number,
  target: number,
): number {
  let low = 0;
  let high = segments.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (end(segments[mid]) < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
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
