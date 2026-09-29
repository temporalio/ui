import type { TimeRange } from './time-viewport';

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value));

export function boundTimeRange(range: TimeRange, bounds: TimeRange): TimeRange {
  const span = bounds.endMs - bounds.startMs;
  const duration = clamp(range.endMs - range.startMs, 1, span);
  const startMs = clamp(range.startMs, bounds.startMs, bounds.endMs - duration);
  return { startMs, endMs: startMs + duration };
}

export function getWheelTimeRange({
  deltaX,
  deltaY,
  deltaMode,
  trackWidth,
  selection,
  domain,
  minDurationMs,
  pinnedLive,
}: {
  deltaX: number;
  deltaY: number;
  deltaMode: number;
  trackWidth: number;
  selection: TimeRange;
  domain: TimeRange;
  minDurationMs: number;
  pinnedLive: boolean;
}): TimeRange | null {
  const duration = selection.endMs - selection.startMs;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    const width = Math.max(1, trackWidth);
    const deltaPx =
      deltaX * (deltaMode === 1 ? 16 : deltaMode === 2 ? width : 1);
    const offset = (deltaPx / width) * duration;
    return boundTimeRange(
      { startMs: selection.startMs + offset, endMs: selection.endMs + offset },
      domain,
    );
  }
  if (!deltaY) return null;

  const span = domain.endMs - domain.startMs;
  const sensitivity = deltaMode === 1 ? 0.04 : deltaMode === 2 ? 0.45 : 0.002;
  const factor = Math.exp(clamp(deltaY * sensitivity, -0.35, 0.35));
  const nextDuration = clamp(
    duration * factor,
    Math.min(span, Math.max(1, minDurationMs)),
    span,
  );
  if (Math.abs(nextDuration - duration) < 0.001) return null;

  const centerMs = (selection.startMs + selection.endMs) / 2;
  const startMs = pinnedLive
    ? selection.endMs - nextDuration
    : centerMs - nextDuration / 2;
  return boundTimeRange({ startMs, endMs: startMs + nextDuration }, domain);
}
