export interface TimelineAxisTick {
  screenPx: number;
  worldPx: number;
}

export function getNiceTimelineIntervalMs(
  targetIntervalMs: number,
  /** Whole seconds by default; a shorter span can ask for less. */
  minIntervalMs = 1000,
): number {
  const targetSeconds = Math.max(minIntervalMs / 1000, targetIntervalMs / 1000);
  const magnitude = 10 ** Math.floor(Math.log10(targetSeconds));
  const candidates = [1, 2, 5, 10].map((multiple) => multiple * magnitude);
  const intervalSeconds = candidates.reduce((closest, candidate) =>
    Math.abs(candidate - targetSeconds) < Math.abs(closest - targetSeconds)
      ? candidate
      : closest,
  );
  return Math.max(1, Math.round(intervalSeconds * 1000));
}

export function getTimelineTimeTicks({
  visibleStartTimeMs,
  visibleEndTimeMs,
  originTimeMs,
  intervalMs,
  project,
  viewportOffsetPx,
  gutterPx,
  screenStartPx,
  screenEndPx,
  collapsedTimeRanges = [],
}: {
  visibleStartTimeMs: number;
  visibleEndTimeMs: number;
  originTimeMs: number;
  intervalMs: number;
  project: (timeMs: number) => number;
  viewportOffsetPx: number;
  gutterPx: number;
  screenStartPx: number;
  screenEndPx: number;
  collapsedTimeRanges?: { startTimeMs: number; endTimeMs: number }[];
}): TimelineAxisTick[] {
  if (intervalMs <= 0 || visibleEndTimeMs < visibleStartTimeMs) return [];

  const firstIndex = Math.max(
    0,
    Math.ceil((visibleStartTimeMs - originTimeMs) / intervalMs),
  );
  const lastIndex = Math.floor((visibleEndTimeMs - originTimeMs) / intervalMs);
  const collapsedRanges = [...collapsedTimeRanges].sort(
    (a, b) => a.startTimeMs - b.startTimeMs,
  );
  const ticks: TimelineAxisTick[] = [];
  let tickIndex = firstIndex;
  let collapsedRangeIndex = 0;

  while (tickIndex <= lastIndex) {
    const timeMs = originTimeMs + tickIndex * intervalMs;

    while (collapsedRanges[collapsedRangeIndex]?.endTimeMs < timeMs) {
      collapsedRangeIndex += 1;
    }

    const collapsedRange = collapsedRanges[collapsedRangeIndex];
    if (
      collapsedRange &&
      timeMs >= collapsedRange.startTimeMs &&
      timeMs <= collapsedRange.endTimeMs
    ) {
      tickIndex = Math.max(
        tickIndex + 1,
        Math.floor((collapsedRange.endTimeMs - originTimeMs) / intervalMs) + 1,
      );
      continue;
    }

    const worldPx = project(timeMs);
    const screenPx = worldPx - viewportOffsetPx + gutterPx;
    if (screenPx >= screenStartPx && screenPx <= screenEndPx) {
      ticks.push({ worldPx, screenPx });
    }
    tickIndex += 1;
  }

  return ticks;
}

export function screenToTimelineWorld(
  screenPx: number,
  gutterPx: number,
  viewportOffsetPx: number,
): number {
  return screenPx - gutterPx + viewportOffsetPx;
}
