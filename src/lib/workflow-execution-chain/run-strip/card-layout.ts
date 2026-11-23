export const MIN_CARD_WIDTH = 148;
export const CAP_WIDTH = 36;
export const CARD_GAP = 6;
const INITIAL_VISIBLE_RUNS = 4;
export const TRAILING_PADDING = 4;

export type RunSegment = {
  id: string;
  x: number;
  width: number;
  startMs: number;
  endMs: number;
  live: boolean;
};

export type RunSpan = {
  id: string;
  startMs: number;
  endMs: number;
  live: boolean;
};

const sumOf = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

const fittedWidthFor = (visibleCount: number, viewportWidth: number): number =>
  viewportWidth - CARD_GAP * (visibleCount - 1);

const LIVE_RESIZE_FACTOR = 2;

/**
 * The live Run's duration, rounded down to a power of `LIVE_RESIZE_FACTOR`
 * seconds, so its card resizes each time it grows that much rather than on
 * every tick.
 */
export const steppedLiveDuration = (durationMs: number): number => {
  if (durationMs < 1000) {
    return 0;
  }
  const steps = Math.floor(
    Math.log(durationMs / 1000) / Math.log(LIVE_RESIZE_FACTOR),
  );
  return LIVE_RESIZE_FACTOR ** steps * 1000;
};

export const allocateCardWidths = (
  durations: readonly number[],
  viewportWidth: number,
): number[] => {
  if (durations.length === 0) {
    return [];
  }
  const newestDurations = durations.slice(-INITIAL_VISIBLE_RUNS);
  const fittedWidth = fittedWidthFor(newestDurations.length, viewportWidth);
  const spareWidth = Math.max(
    0,
    fittedWidth - newestDurations.length * MIN_CARD_WIDTH,
  );
  const totalDuration = sumOf(newestDurations);
  const maxWidth = Math.max(MIN_CARD_WIDTH, fittedWidth);

  return durations.map((duration) => {
    const extraWidth =
      totalDuration > 0
        ? (spareWidth * Math.max(0, duration)) / totalDuration
        : spareWidth / newestDurations.length;
    return Math.min(maxWidth, MIN_CARD_WIDTH + extraWidth);
  });
};

export type FrozenWidths = {
  viewportWidth: number;
  widths: ReadonlyMap<string, number>;
};

export const freezeWidths = (
  runIds: readonly string[],
  widths: readonly number[],
  viewportWidth: number,
): FrozenWidths => ({
  viewportWidth,
  widths: new Map(runIds.map((runId, index) => [runId, widths[index]])),
});

/**
 * Keeps every card but the Latest Run's at its frozen width, so cards the
 * user has scrolled to hold still while the Latest Run grows or hands off.
 */
export const applyFrozenWidths = (
  runIds: readonly string[],
  widths: readonly number[],
  frozen: FrozenWidths | null,
  {
    viewportWidth,
    latestRunId,
  }: { viewportWidth: number; latestRunId: string | null },
): number[] => {
  if (!frozen || frozen.viewportWidth !== viewportWidth) {
    return [...widths];
  }
  return runIds.map((runId, index) => {
    const frozenWidth = frozen.widths.get(runId);
    if (runId === latestRunId || frozenWidth === undefined) {
      return widths[index];
    }
    return frozenWidth;
  });
};

export const layoutSegments = (
  widths: readonly number[],
  spans: readonly RunSpan[],
  offset = 0,
): RunSegment[] => {
  let x = offset;
  return widths.map((width, index) => {
    const { id, startMs, endMs, live } = spans[index];
    const segment = {
      id,
      x,
      width,
      startMs,
      endMs: Math.max(endMs, startMs + 1),
      live,
    };
    x += width + CARD_GAP;
    return segment;
  });
};
