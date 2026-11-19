export const MIN_CARD_WIDTH = 148;
export const CAP_WIDTH = 36;
export const CARD_GAP = 6;
export const INITIAL_VISIBLE_RUNS = 4;
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

export const liveCardWidth = (
  runCount: number,
  viewportWidth: number,
): number => {
  const visibleCount = Math.min(Math.max(runCount, 1), INITIAL_VISIBLE_RUNS);
  return Math.max(
    MIN_CARD_WIDTH,
    fittedWidthFor(visibleCount, viewportWidth) / visibleCount,
  );
};

export const allocateCardWidths = (
  durations: readonly number[],
  viewportWidth: number,
  { latestIsLive = false }: { latestIsLive?: boolean } = {},
): number[] => {
  if (durations.length === 0) {
    return [];
  }
  const newestDurations = durations.slice(-INITIAL_VISIBLE_RUNS);
  const fittedWidth = fittedWidthFor(newestDurations.length, viewportWidth);
  const liveWidth = liveCardWidth(durations.length, viewportWidth);
  const proportionalDurations = latestIsLive
    ? newestDurations.slice(0, -1)
    : newestDurations;
  const proportionalWidth = latestIsLive
    ? fittedWidth - liveWidth
    : fittedWidth;
  const spareWidth = Math.max(
    0,
    proportionalWidth - proportionalDurations.length * MIN_CARD_WIDTH,
  );
  const proportionalTotalDuration = sumOf(proportionalDurations);
  const maxWidth = Math.max(MIN_CARD_WIDTH, fittedWidth);
  const latestIndex = durations.length - 1;

  return durations.map((duration, index) => {
    if (latestIsLive && index === latestIndex) {
      return liveWidth;
    }
    const extraWidth =
      proportionalTotalDuration > 0
        ? (spareWidth * Math.max(0, duration)) / proportionalTotalDuration
        : spareWidth / Math.max(1, proportionalDurations.length);
    return Math.min(maxWidth, MIN_CARD_WIDTH + extraWidth);
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
