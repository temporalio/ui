import {
  add,
  formatDuration as durationToString,
  intervalToDuration,
  parseISO,
  sub,
} from 'date-fns';

import { isObject, isString } from './is';
import { pluralize } from './pluralize';

type DurationKey = keyof Duration;

export const durationKeys: Readonly<DurationKey[]> = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
] as const;

export const durations = [
  '15 minutes',
  '1 hour',
  '3 hours',
  '24 hours',
  '3 days',
  '7 days',
  '30 days',
  '90 days',
];

export const columnOrderedDurations = [
  '15 minutes',
  '3 days',
  '1 hour',
  '7 days',
  '3 hours',
  '30 days',
  '24 hours',
  '90 days',
];

const durationPattern = new RegExp(
  `(\\d+)\\s(${durationKeys.map((k) => k + '?').join('|')})`,
  'g',
);

export const isDurationKey = (key: unknown): key is DurationKey => {
  if (!isString(key)) return false;

  for (const durationKey of durationKeys) {
    if (durationKey === key) return true;
  }

  return false;
};

export const isDuration = (value: unknown): value is Duration => {
  if (!isObject(value)) return false;

  for (const key of Object.keys(value)) {
    if (!isDurationKey(key)) return false;
  }

  return true;
};

export const isDurationString = (value: unknown): value is string => {
  if (!isString(value)) return false;

  return !!value.match(durationPattern);
};

export const tomorrow = (date = new Date()): string => {
  return add(date, { hours: 24 }).toISOString();
};

export const toDuration = (value: string): Duration => {
  const duration: Duration = {};
  const segments = value.match(durationPattern);

  if (!segments) return duration;

  for (const segment of segments) {
    const [amount, unit] = segment.split(' ');
    const n = parseInt(amount, 10);

    let key = unit;

    if (!unit.endsWith('s')) key = unit + 's';

    if (isDurationKey(key)) {
      duration[key] = n;
    }
  }

  return duration;
};

const singularlize = (unit: string, amount: number): string => {
  if (amount === 1) return unit.slice(0, unit.length - 1);
  return unit;
};

export const toString = (duration: Duration): string => {
  const [[units, amount]] = Object.entries(duration);
  return `${amount} ${singularlize(units, amount)}`;
};

export const toDate = (timeRange: Duration | string): string => {
  const duration =
    typeof timeRange === 'string' ? toDuration(timeRange) : timeRange;

  return sub(new Date(), duration).toISOString();
};

export const fromDate = (
  start: string | Date,
  end: string | Date = new Date(),
): Duration => {
  if (isString(start)) start = parseISO(start);
  if (isString(end)) end = parseISO(end);

  return intervalToDuration({ start, end });
};

export const fromSeconds = (
  seconds: string,
  { delimiter = ', ' } = {},
): string => {
  const parsedSeconds = parseInt(seconds);
  const parsedDecimal = parseFloat(`.${seconds.split('.')[1] ?? 0}`);

  if (!seconds.endsWith('s')) return '';
  if (isNaN(parsedSeconds) || isNaN(parsedDecimal)) return '';

  const start = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
  const end = new Date(Date.UTC(0, 0, 0, 0, 0, parsedSeconds));
  const duration = intervalToDuration({ start, end });
  const durationString = durationToString(duration, { delimiter });
  const milliseconds =
    Math.round(parsedDecimal * 1000 * 1000000000) / 1000000000; // round to nanoseconds

  if (!milliseconds) return durationString;
  if (!durationString)
    return `${milliseconds} ${pluralize('millisecond', milliseconds)}`;
  if (parsedSeconds < 60) {
    return `${durationString}, ${milliseconds.toFixed(0)} ${pluralize(
      'millisecond',
      milliseconds,
    )}`;
  }

  return `${durationString}`;
};

export const isValidDurationQuery = (value: string): boolean => {
  const isValidNumber = !isNaN(Number(value));
  const isValidGolangDuration =
    /^-?\d+\S*$/.test(value) &&
    ['ns', 'us', 'µs', 'ms', 's', 'm', 'h'].some((char) =>
      value.endsWith(char),
    );
  const isValidTime = /^\d+:[0-5][0-9]:[0-5][0-9]$/.test(value);

  return isValidNumber || isValidGolangDuration || isValidTime;
};
