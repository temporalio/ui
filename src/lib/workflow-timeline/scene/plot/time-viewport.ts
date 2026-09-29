import type { FlattenedSceneRow } from '../structure/types';

/** A closed interval on the shared timeline axis, in Unix milliseconds. */
export type TimeRange = Readonly<{ startMs: number; endMs: number }>;

/** Returns the known bounds of all loaded lifecycle rows. */
export function getTimeDomain(
  rows: readonly FlattenedSceneRow[],
): TimeRange | null {
  let startMs = Infinity;
  let endMs = -Infinity;

  for (const item of rows) {
    if (item.kind !== 'event') continue;
    startMs = Math.min(startMs, item.row.startTimeMs, item.row.endTimeMs);
    endMs = Math.max(endMs, item.row.startTimeMs, item.row.endTimeMs);
  }

  if (!Number.isFinite(startMs)) return null;
  return { startMs, endMs: Math.max(endMs, startMs + 1) };
}

/** Projects an absolute timestamp to a horizontal pixel position. */
export function timeToX(
  timeMs: number,
  viewport: TimeRange,
  widthPx: number,
): number {
  return (
    ((timeMs - viewport.startMs) / (viewport.endMs - viewport.startMs)) *
    widthPx
  );
}

/** Chooses an absolute-time tick interval for the visible plot width. */
export function getTimeTickStep(viewport: TimeRange, widthPx: number): number {
  if (widthPx <= 0) return 0;

  const roughStep = ((viewport.endMs - viewport.startMs) * 180) / widthPx;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  return (
    [1, 2, 5, 10]
      .map((multiple) => multiple * magnitude)
      .find((candidate) => candidate >= roughStep) ?? 10 * magnitude
  );
}

/** Returns absolute-time ticks spaced for the visible plot width. */
export function getTimeTicks(
  viewport: TimeRange,
  widthPx: number,
): readonly number[] {
  const step = getTimeTickStep(viewport, widthPx);
  if (!step) return [];

  const ticks: number[] = [];

  for (
    let time = Math.ceil(viewport.startMs / step) * step;
    time <= viewport.endMs;
    time += step
  ) {
    ticks.push(time);
  }

  return ticks;
}
