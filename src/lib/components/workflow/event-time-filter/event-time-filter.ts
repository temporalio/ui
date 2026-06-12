import { startOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

const toZoned = (d: Date | null, timezone: string) =>
  d ? utcToZonedTime(d, timezone) : null;

export const toStartOfDayInTz = (
  d: Date | null,
  timezone: string,
  now: Date = new Date(),
): Date => {
  const z = toZoned(d, timezone) ?? now;
  return startOfDay(new Date(z.getFullYear(), z.getMonth(), z.getDate()));
};

export const composeDate = (
  date: Date,
  hour: string,
  minute: string,
  second: string,
  timezone: string,
): Date => {
  const wallClock = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    parseInt(hour) || 0,
    parseInt(minute) || 0,
    parseInt(second) || 0,
    0,
  );
  return zonedTimeToUtc(wallClock, timezone);
};

export type DateRangeBounds = {
  defaultStart: Date | null;
  defaultEnd: Date | null;
  timezone: string;
  now?: Date;
};

export const isDateAllowed = (d: Date, bounds: DateRangeBounds): boolean => {
  const cellDay = startOfDay(d).getTime();
  const { defaultStart, defaultEnd, timezone, now } = bounds;
  if (
    defaultStart &&
    cellDay < toStartOfDayInTz(defaultStart, timezone, now).getTime()
  ) {
    return false;
  }
  const upperBound = defaultEnd ?? now ?? new Date();
  if (cellDay > toStartOfDayInTz(upperBound, timezone, now).getTime()) {
    return false;
  }
  return true;
};

export const isEndDateAllowed = (
  d: Date,
  bounds: DateRangeBounds & { startDate: Date },
): boolean => {
  if (!isDateAllowed(d, bounds)) return false;
  return startOfDay(d).getTime() >= bounds.startDate.getTime();
};

export type EndBeforeStartArgs = {
  endEnabled: boolean;
  startDate: Date;
  startHour: string;
  startMinute: string;
  startSecond: string;
  endDate: Date;
  endHour: string;
  endMinute: string;
  endSecond: string;
  timezone: string;
};

export const endBeforeStart = (args: EndBeforeStartArgs): boolean => {
  if (!args.endEnabled) return false;
  const start = composeDate(
    args.startDate,
    args.startHour,
    args.startMinute,
    args.startSecond,
    args.timezone,
  );
  const end = composeDate(
    args.endDate,
    args.endHour,
    args.endMinute,
    args.endSecond,
    args.timezone,
  );
  return end.getTime() < start.getTime();
};
