import type { HourFormat } from '$lib/utilities/format-date';
import { BASE_TIME_FORMAT_OPTIONS, getTimezone } from '$lib/utilities/timezone';

export const MIN_CARD_WIDTH = 148;
export const CAP_WIDTH = 36;
export const CARD_GAP = 6;
export const INITIAL_VISIBLE_RUNS = 4;

const MAJOR_TICK_SPACING = 92;
const MINOR_TICK_SPACING = 12;
const MAJOR_LABEL_FROM_START = 126;
const MAJOR_LABEL_TO_END = 44;
const DATED_MAJOR_LABEL_FROM_START = 186;
const DATED_MAJOR_LABEL_TO_END = 56;
const MINOR_TICK_INSET = 6;

const SECOND_MS = 1_000;
export const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

const stepsOf = (unitMs: number, counts: number[]): number[] =>
  counts.map((count) => count * unitMs);

export const CLOCK_STEPS = [
  ...stepsOf(SECOND_MS, [1, 2, 5, 10, 15, 30]),
  ...stepsOf(MINUTE_MS, [1, 2, 5, 10, 15, 30]),
  ...stepsOf(HOUR_MS, [1, 2, 3, 6, 12]),
  ...stepsOf(DAY_MS, [1, 2, 7, 30, 90, 365]),
];

export type RulerSegment = {
  id: string;
  x: number;
  width: number;
  startMs: number;
  endMs: number;
};

export type RulerTick = {
  segmentId: string;
  time: number;
  x: number;
  kind: 'run' | 'major' | 'minor';
  step: number;
  labelled: boolean;
};

const sumOf = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0);

export const allocateCardWidths = (
  durations: readonly number[],
  viewportWidth: number,
): number[] => {
  if (durations.length === 0) {
    return [];
  }
  const newest = durations.slice(-INITIAL_VISIBLE_RUNS);
  const fitted = viewportWidth - CARD_GAP * (newest.length - 1);
  const spare = Math.max(0, fitted - newest.length * MIN_CARD_WIDTH);
  const total = sumOf(newest);
  const maxWidth = Math.max(MIN_CARD_WIDTH, fitted);

  return durations.map((duration) => {
    const share =
      total > 0
        ? (spare * Math.max(0, duration)) / total
        : spare / newest.length;
    return Math.min(maxWidth, MIN_CARD_WIDTH + share);
  });
};

export const layoutSegments = (
  widths: readonly number[],
  spans: readonly { id: string; startMs: number; endMs: number }[],
  offset = 0,
): RulerSegment[] => {
  let x = offset;
  return widths.map((width, index) => {
    const { id, startMs, endMs } = spans[index];
    const segment = {
      id,
      x,
      width,
      startMs,
      endMs: Math.max(endMs, startMs + 1),
    };
    x += width + CARD_GAP;
    return segment;
  });
};

export const pickClockStep = (msPerPx: number): number =>
  CLOCK_STEPS.find((step) => step / msPerPx >= MAJOR_TICK_SPACING) ??
  CLOCK_STEPS[CLOCK_STEPS.length - 1];

export const buildRulerTicks = (
  segments: readonly RulerSegment[],
): RulerTick[] => {
  const ticks: RulerTick[] = [];
  for (const segment of segments) {
    const span = segment.endMs - segment.startMs;
    if (segment.width <= 0 || span <= 0) {
      continue;
    }
    const msPerPx = span / segment.width;
    const step = pickClockStep(msPerPx);
    ticks.push({
      segmentId: segment.id,
      time: segment.startMs,
      x: segment.x,
      kind: 'run',
      step,
      labelled: true,
    });

    if (step / msPerPx < MAJOR_TICK_SPACING) {
      continue;
    }
    const dated = step >= DAY_MS;
    const labelFromStart = dated
      ? DATED_MAJOR_LABEL_FROM_START
      : MAJOR_LABEL_FROM_START;
    const labelToEnd = dated ? DATED_MAJOR_LABEL_TO_END : MAJOR_LABEL_TO_END;
    const minor = step / 2;
    const tickMs = minor / msPerPx >= MINOR_TICK_SPACING ? minor : step;
    const first = Math.floor(segment.startMs / tickMs + 1) * tickMs;
    for (let time = first; time < segment.endMs; time += tickMs) {
      const x = segment.x + (time - segment.startMs) / msPerPx;
      const fromStart = x - segment.x;
      const toEnd = segment.x + segment.width - x;
      if (fromStart < MINOR_TICK_INSET || toEnd < MINOR_TICK_INSET) {
        continue;
      }
      const major = time % step === 0;
      ticks.push({
        segmentId: segment.id,
        time,
        x,
        kind: major ? 'major' : 'minor',
        step,
        labelled: major && fromStart >= labelFromStart && toEnd >= labelToEnd,
      });
    }
  }
  return ticks;
};

type ClockTimeOptions = {
  timeFormat: string;
  hourFormat: HourFormat;
  seconds?: boolean;
  date?: boolean;
};

const clockFormatters = new Map<string, Intl.DateTimeFormat>();

export const formatClockTime = (
  time: number,
  { timeFormat, hourFormat, seconds = true, date = false }: ClockTimeOptions,
): string => {
  const timeZone =
    timeFormat === BASE_TIME_FORMAT_OPTIONS.LOCAL
      ? undefined
      : getTimezone(timeFormat);
  const key = `${timeZone ?? 'local'}|${hourFormat}|${seconds}|${date}`;
  let formatter = clockFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      ...(seconds && { second: '2-digit' }),
      ...(date && { month: 'short', day: 'numeric' }),
      ...(hourFormat !== 'system' && { hour12: hourFormat === '12' }),
      ...(timeZone && { timeZone }),
    });
    clockFormatters.set(key, formatter);
  }
  return formatter.format(time);
};
