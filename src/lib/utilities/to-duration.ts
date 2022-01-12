import { formatISO, sub } from 'date-fns';

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

const durationPattern = new RegExp(`(\\d+)\\s(${durationKeys.join('|')})`);

const isDurationKey = (key: unknown): key is DurationKey => {
  if (typeof key !== 'string') return false;

  for (const durationKey of durationKeys) {
    if (durationKey === key) return true;
  }

  return false;
};

export const isDuration = (value: unknown): value is Duration => {
  if (typeof value !== 'object') return false;

  for (const key of Object.keys(value)) {
    if (!isDurationKey(key)) return false;
  }

  return true;
};

export const isDurationString = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const [, amount, units] = value.match(durationPattern);
  return !!amount && !!units;
};

export const toDuration = (value: string): Duration => {
  const [, amount, units] = value.match(durationPattern);
  return { [units]: parseInt(amount, 10) };
};

export const toString = (duration: Duration): string => {
  const units = Object.keys(duration)[0];
  const amount: number = duration[units];
  return `${amount} ${units}`;
};

export const toDate = (timeRange: Duration | string): string => {
  const duration =
    typeof timeRange === 'string' ? toDuration(timeRange) : timeRange;
  return formatISO(sub(new Date(), duration));
};
