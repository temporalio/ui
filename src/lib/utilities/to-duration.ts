import { formatISO, sub, add, intervalToDuration, parseISO } from 'date-fns';
import { isString, isObject } from './is';

type DurationKey = typeof durationKeys;

const durationKeys = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
] as const;

export const durations = [
  '10 minutes',
  '60 minutes',
  '3 hours',
  '24 hours',
  '3 days',
  '7 days',
  '30 days',
  '90 days',
];

const durationPattern = new RegExp(`(\\d+)\\s(${durationKeys.join('|')})`, 'g');

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

export const tomorrow = (): string => {
  return formatISO(add(new Date(), { hours: 24 }));
};

export const toDuration = (value: string, delimiter = ','): Duration => {
  const duration: Duration = {};
  const segments = value.match(durationPattern);

  for (const segment of segments) {
    const [amount, unit] = segment.split(' ');
    if (isDurationKey(unit)) {
      duration[unit] = parseInt(amount, 10);
    }
  }

  return duration;
};

export const toString = (duration: Duration): string => {
  let units = Object.keys(duration)[0];
  const amount: number = duration[units];

  if (amount === 1) units = units.slice(0, units.length - 1);

  return `${amount} ${units}`;
};

export const toDate = (timeRange: Duration | string): string => {
  const duration =
    typeof timeRange === 'string' ? toDuration(timeRange) : timeRange;

  return formatISO(sub(new Date(), duration));
};

export const fromDate = (
  start: string | Date,
  end: string | Date = new Date(),
): Duration => {
  if (isString(start)) start = parseISO(start);
  if (isString(end)) end = parseISO(end);

  return intervalToDuration({ start, end });
};

export const fromSeconds = (seconds: string): Duration => {
  const milliseconds = parseInt(seconds) * 1000;

  if (!seconds.endsWith('s')) return undefined;
  if (isNaN(milliseconds)) return undefined;

  return intervalToDuration({ start: 0, end: milliseconds });
};
