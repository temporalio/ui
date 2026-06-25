import {
  max as dateFnsMax,
  min as dateFnsMin,
  differenceInDays,
  formatDuration as durationToString,
  getMilliseconds as getSecondAsMilliseconds,
  intervalToDuration,
  parseJSON,
} from 'date-fns';

import type { Timestamp } from '$lib/types';

import { has } from './has';
import { fromSeconds } from './to-duration';

export type ValidTime = Parameters<typeof parseJSON>[0] | Timestamp;

// PERF SORT: timestamp strings are stable across a session; re-parsing them on
// every sort/y-change (N rows × 2 parseJSON calls) was visible in CPUTraceSort.
// This module-level cache converts each unique string once and returns the same
// Date object on subsequent calls.
const parseJSONCache = new Map<string, Date>();
function cachedParseJSON(value: ValidTime): Date {
  if (typeof value === 'string') {
    let d = parseJSONCache.get(value);
    if (!d) {
      d = parseJSON(value);
      parseJSONCache.set(value, d);
    }
    return d;
  }
  return parseJSON(value as string | number | Date);
}

export function timestampToDate(ts: Timestamp): Date {
  if (!isTimestamp(ts)) {
    throw new TypeError('provided value is not a timestamp');
  }

  const d = new Date();

  d.setTime(Number(ts.seconds) * 1000 + (ts.nanos || 0) / 1000000);

  return d;
}

export function isTimestamp(arg: unknown): arg is Timestamp {
  if (typeof arg === 'object') {
    return has(arg, 'seconds') && has(arg, 'nanos');
  }
  return false;
}

/**
 * Converts a {@link ValidTime} (a {@link Timestamp} object, ISO 8601 string,
 * epoch number, or `Date`) into a `Date` instance.
 *
 * If the input is a {@link Timestamp}, its `seconds` and `nanos` fields are
 * combined into a millisecond-precision `Date`. Otherwise the value is parsed
 * via `date-fns`'s `parseJSON`.
 *
 * @param validTime - The time value to convert.
 * @returns A `Date` representing `validTime`. The returned `Date` is
 *   guaranteed to be valid (i.e. its time value is never `NaN`).
 * @throws {TypeError} If `validTime` is a string/number that cannot be parsed
 *   into a valid date.
 */
export function validTimeToDate(validTime: ValidTime): Date {
  if (isTimestamp(validTime)) {
    return timestampToDate(validTime);
  }

  const parsedDate = cachedParseJSON(validTime);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new TypeError(`Invalid time: ${String(validTime)}`);
  }

  return parsedDate;
}

/**
 * Returns the earliest `Date` from the given times.
 *
 * Each argument is normalized via {@link validTimeToDate} before comparison,
 * so a mix of {@link Timestamp} objects, ISO 8601 strings, epoch numbers, and
 * `Date` instances is accepted.
 *
 * @param validTimes - One or more times to compare.
 * @returns The earliest time as a `Date`.
 * @throws {RangeError} If called with no arguments.
 * @throws {TypeError} If any argument cannot be converted to a valid `Date`
 *   (propagated from {@link validTimeToDate}).
 */
export function minDate(...validTimes: ValidTime[]): Date {
  if (!validTimes.length) {
    throw new RangeError('Requires at least one time');
  }

  return dateFnsMin(validTimes.map((validTime) => validTimeToDate(validTime)));
}

/**
 * Returns the latest `Date` from the given times.
 *
 * Each argument is normalized via {@link validTimeToDate} before comparison,
 * so a mix of {@link Timestamp} objects, ISO 8601 strings, epoch numbers, and
 * `Date` instances is accepted.
 *
 * @param validTimes - One or more times to compare.
 * @returns The latest time as a `Date`.
 * @throws {RangeError} If called with no arguments.
 * @throws {TypeError} If any argument cannot be converted to a valid `Date`
 *   (propagated from {@link validTimeToDate}).
 */
export function maxDate(...validTimes: ValidTime[]): Date {
  if (!validTimes.length) {
    throw new RangeError('Requires at least one time');
  }

  return dateFnsMax(validTimes.map((validTime) => validTimeToDate(validTime)));
}

export function formatDuration(
  duration: Duration | string | null,
  delimiter = ', ',
): string {
  if (duration === null || !duration) return '';
  if (typeof duration === 'string') return fromSeconds(duration, { delimiter });
  return durationToString(duration, { delimiter });
}

export function formatDurationAbbreviated(
  duration: Duration | string,
  delimiter?: string,
): string {
  return formatDistanceToSingleLetters(formatDuration(duration, delimiter));
}

function formatDistanceToSingleLetters(distance: string) {
  if (!distance) return '';
  distance = distance
    .replace(/milliseconds/g, 'ms')
    .replace(/millisecond/g, 'ms')
    .replace(/ ms/g, 'ms')
    .replace(/seconds/g, 'second')
    .replace(/second/g, 's')
    .replace(/ s/g, 's')
    .replace(/minutes/g, 'minute')
    .replace(/minute/g, 'm')
    .replace(/ m/g, 'm')
    .replace(/hours/g, 'hour')
    .replace(/hour/g, 'h')
    .replace(/ h/g, 'h')
    .replace(/days/g, 'day')
    .replace(/day/g, 'd')
    .replace(/ d/g, 'd')
    .replace(/weeks/g, 'week')
    .replace(/week/g, 'w')
    .replace(/ w/g, 'w')
    .replace(/ month/g, 'month')
    .replace(/ months/g, 'months')
    .replace(/ year/g, 'year')
    .replace(/ years/g, 'years');
  return distance;
}

export function getDuration({
  start,
  end,
  flexibleUnits = false,
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
  flexibleUnits?: boolean;
}): Duration | null {
  if (!start || !end) return null;

  try {
    const parsedStart = validTimeToDate(start);
    const parsedEnd = validTimeToDate(end);

    const duration = intervalToDuration({ start: parsedStart, end: parsedEnd });
    return flexibleUnits
      ? duration
      : {
          years: 0,
          months: 0,
          days: differenceInDays(parsedEnd, parsedStart),
          hours: duration.hours,
          minutes: duration.minutes,
          seconds: duration.seconds,
        };
  } catch {
    return null;
  }
}

export function getMillisecondDuration({
  start,
  end,
  onlyUnderSecond = true,
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
  onlyUnderSecond?: boolean;
}): number | null {
  if (!start || !end) return null;

  try {
    const parsedStart = validTimeToDate(start);
    const parsedEnd = validTimeToDate(end);
    const ms = parsedEnd.getTime() - parsedStart.getTime();
    return onlyUnderSecond ? Math.abs(ms % 1000) : Math.abs(ms);
  } catch {
    return null;
  }
}

export function formatDistance({
  start,
  end,
  includeMilliseconds = false,
  includeMillisecondsForUnderSecond = false,
  flexibleUnits = false,
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
  includeMilliseconds?: boolean;
  includeMillisecondsForUnderSecond?: boolean;
  flexibleUnits?: boolean;
}): string {
  const duration = getDuration({ start, end, flexibleUnits });
  const distance = formatDuration(duration);
  const msDuration = getMillisecondDuration({ start, end });

  if (!distance && msDuration && includeMillisecondsForUnderSecond) {
    return `${msDuration}ms`.trim();
  } else if (includeMilliseconds && msDuration) {
    return `${distance} ${msDuration}ms`.trim();
  } else {
    return distance;
  }
}

export function formatDistanceAbbreviated({
  start,
  end,
  includeMilliseconds = false,
  includeMillisecondsForUnderSecond = false,
  flexibleUnits = false,
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
  includeMilliseconds?: boolean;
  includeMillisecondsForUnderSecond?: boolean;
  flexibleUnits?: boolean;
}): string {
  const duration = getDuration({ start, end, flexibleUnits });
  const distance = formatDuration(duration, ' ');
  const formattedDistance = formatDistanceToSingleLetters(distance);
  const msDuration = getMillisecondDuration({ start, end });

  if (!distance && msDuration && includeMillisecondsForUnderSecond) {
    return `${msDuration}ms`.trim();
  } else if (includeMilliseconds && msDuration) {
    return `${formattedDistance} ${msDuration}ms`.trim();
  } else {
    return formattedDistance;
  }
}

export function getMilliseconds(date: ValidTime | undefined | null): number {
  if (!date) return 0;
  return getSecondAsMilliseconds(validTimeToDate(date));
}

export function fromSecondsToMinutesAndSeconds(seconds: number): string {
  if (!seconds) return '';
  const start = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
  const end = new Date(Date.UTC(0, 0, 0, 0, 0, Math.floor(seconds)));
  const duration = intervalToDuration({
    start,
    end,
  });
  return durationToString(duration, { format: ['minutes', 'seconds'] });
}

export function fromSecondsToDaysOrHours(seconds: string | number): string {
  if (!seconds) return '';

  if (typeof seconds === 'string') {
    if (seconds.includes('s')) {
      seconds = seconds.replace('s', '');
    }

    seconds = parseInt(seconds);
  }

  const hours = Math.floor(seconds / (60 * 60));
  const days = Math.floor(seconds / (24 * 60 * 60));

  if (days === 1) return days + ' day';
  if (days > 1) return days + ' days';
  if (hours === 1) return hours + ' hour';
  return hours + ' hours';
}

export const getTimestampDifference = (
  date1: string,
  date2: string,
): number => {
  if (!date1 || !date2) {
    return 0;
  }
  const parse1 = Date.parse(date1);
  const parse2 = Date.parse(date2);
  return Math.abs(parse1 - parse2);
};

export const formatSecondsAbbreviated = (seconds: number | string): string => {
  const start = new Date();
  const end = new Date(start.getTime() + Number(seconds) * 1000);
  return formatDistanceAbbreviated({ start, end, includeMilliseconds: true });
};

export const fromDurationToNumber = (duration: string): string => {
  if (!duration || !duration.endsWith('s')) {
    return '';
  }

  return duration?.replace('s', '');
};

export const fromNumberToDuration = (duration: string): string | undefined => {
  if (!duration) return undefined;
  return duration + 's';
};
