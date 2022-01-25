import { formatISO, sub } from 'date-fns';

type DurationKey = typeof durationKeys;

const millisecond = 1;
const second = millisecond * 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;
const year = day * 365;

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

const durationPattern = new RegExp(`(\\d+)\\s(${durationKeys.join('|')})`);

export const isDurationKey = (key: unknown): key is DurationKey => {
  if (typeof key !== 'string') return false;

  for (const durationKey of durationKeys) {
    if (durationKey === key) return true;
  }

  return false;
};

export const isDuration = (value: unknown): value is Duration => {
  if (value === null) return false;
  if (typeof value !== 'object') return false;

  for (const key of Object.keys(value)) {
    if (!isDurationKey(key)) return false;
  }

  return true;
};

export const isDurationString = (value: unknown): value is string => {
  if (value === null) return false;
  if (typeof value !== 'string') return false;

  const match = value.match(durationPattern);

  if (!match) return false;

  const [, amount, units] = match;
  return !!amount && !!units;
};

export const toDuration = (value: string): Duration => {
  const [, amount, units] = value.match(durationPattern);
  return { [units]: parseInt(amount, 10) };
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

export const fromDate = (targetDate: string | Date): Duration => {
  if (typeof targetDate === 'string') targetDate = new Date(targetDate);

  const currentDate = new Date();
  const difference = Number(currentDate) - Number(targetDate);

  const years = Math.floor(difference / year);
  const days = Math.floor(difference / day);
  const hours = Math.floor(difference / hour);
  const minutes = Math.floor(difference / minute);

  if (years >= 1) return { years };
  if (days >= 1) return { days };
  if (hours >= 1) return { hours };
  if (minutes >= 1) return { minutes };

  return { seconds: difference / 1000 };
};
