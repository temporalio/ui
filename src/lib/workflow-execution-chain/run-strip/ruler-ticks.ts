import type { HourFormat } from '$lib/utilities/format-date';
import { BASE_TIME_FORMAT_OPTIONS, getTimezone } from '$lib/utilities/timezone';

import type { RunSegment } from './card-layout';

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

export type RulerTick = {
  segmentId: string;
  time: number;
  x: number;
  kind: 'run' | 'major' | 'minor';
  step: number;
  labelled: boolean;
};

export const pickClockStep = (msPerPx: number): number =>
  CLOCK_STEPS.find((step) => step / msPerPx >= MAJOR_TICK_SPACING) ??
  CLOCK_STEPS[CLOCK_STEPS.length - 1];

export const buildRulerTicks = (
  segments: readonly RunSegment[],
): RulerTick[] => {
  const ticks: RulerTick[] = [];
  for (const segment of segments) {
    const spanMs = segment.endMs - segment.startMs;
    if (segment.width <= 0 || spanMs <= 0) {
      continue;
    }
    if (segment.live) {
      ticks.push({
        segmentId: segment.id,
        time: segment.startMs,
        x: segment.x,
        kind: 'run',
        step: CLOCK_STEPS[0],
        labelled: true,
      });
      continue;
    }
    const msPerPx = spanMs / segment.width;
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
    const minorStep = step / 2;
    const tickStep =
      minorStep / msPerPx >= MINOR_TICK_SPACING ? minorStep : step;
    const firstTickTime = Math.floor(segment.startMs / tickStep + 1) * tickStep;
    for (let time = firstTickTime; time < segment.endMs; time += tickStep) {
      const x = segment.x + (time - segment.startMs) / msPerPx;
      const fromStart = x - segment.x;
      const toEnd = segment.x + segment.width - x;
      if (fromStart < MINOR_TICK_INSET || toEnd < MINOR_TICK_INSET) {
        continue;
      }
      const isMajor = time % step === 0;
      ticks.push({
        segmentId: segment.id,
        time,
        x,
        kind: isMajor ? 'major' : 'minor',
        step,
        labelled: isMajor && fromStart >= labelFromStart && toEnd >= labelToEnd,
      });
    }
  }
  return ticks;
};

type ClockTimeOptions = {
  timeFormat: string;
  hourFormat: HourFormat;
  withSeconds?: boolean;
  withDate?: boolean;
};

const clockFormatters = new Map<string, Intl.DateTimeFormat>();

export const formatClockTime = (
  time: number,
  {
    timeFormat,
    hourFormat,
    withSeconds = true,
    withDate = false,
  }: ClockTimeOptions,
): string => {
  const timeZone =
    timeFormat === BASE_TIME_FORMAT_OPTIONS.LOCAL
      ? undefined
      : getTimezone(timeFormat);
  const formatterKey = `${timeZone ?? 'local'}|${hourFormat}|${withSeconds}|${withDate}`;
  let formatter = clockFormatters.get(formatterKey);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      ...(withSeconds && { second: '2-digit' }),
      ...(withDate && { month: 'short', day: 'numeric' }),
      ...(hourFormat !== 'system' && { hour12: hourFormat === '12' }),
      ...(timeZone && { timeZone }),
    });
    clockFormatters.set(formatterKey, formatter);
  }
  return formatter.format(time);
};
