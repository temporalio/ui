/** A closed interval on the shared timeline axis, in Unix milliseconds. */
export type TimeRange = Readonly<{ startMs: number; endMs: number }>;

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

const TICK_INTERVALS_MS = [
  1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 15000, 30000,
  60000, 120000, 300000, 600000, 900000, 1800000, 3600000, 7200000, 18000000,
  36000000, 43200000, 86400000,
];

export function getTimeTickStep(viewport: TimeRange, widthPx: number): number {
  if (widthPx <= 0 || viewport.endMs <= viewport.startMs) return 0;

  const roughStep = ((viewport.endMs - viewport.startMs) * 180) / widthPx;
  const interval = TICK_INTERVALS_MS.find(
    (candidate) => candidate >= roughStep,
  );
  if (interval) return interval;

  const dayMs = 86400000;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep / dayMs));
  return (
    [1, 2, 5, 10]
      .map((multiple) => multiple * magnitude * dayMs)
      .find((candidate) => candidate >= roughStep) ?? 10 * magnitude * dayMs
  );
}
export function getTimeTicks(
  viewport: TimeRange,
  widthPx: number,
  originMs: number,
): readonly number[] {
  const step = getTimeTickStep(viewport, widthPx);
  if (!step) return [];

  const ticks: number[] = [];

  for (
    let time =
      originMs + Math.ceil((viewport.startMs - originMs) / step) * step;
    time <= viewport.endMs;
    time += step
  ) {
    ticks.push(time);
  }

  return ticks;
}
