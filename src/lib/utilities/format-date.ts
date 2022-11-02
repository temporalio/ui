import {
  formatDistanceToNow,
  parseJSON,
  formatDuration,
  intervalToDuration,
  getMilliseconds,
} from 'date-fns';
import * as dateTz from 'date-fns-tz'; // `build` script fails on importing some of named CommonJS modules

import type { Timestamp } from '$types';
import { fromSeconds } from './to-duration';

type ValidTime = Parameters<typeof parseJSON>[0] | Timestamp;

const pattern = 'yyyy-MM-dd z HH:mm:ss.SS';

export function formatDate(
  date: ValidTime | undefined | null,
  timeFormat: TimeFormat | string = 'UTC',
  relativeLabel = 'ago',
): string {
  if (!date) return '';

  try {
    if (isTimestamp(date)) {
      date = timestampToDate(date);
    }

    const parsed = parseJSON(date);

    if (timeFormat === 'local') return dateTz.format(parsed, pattern);
    if (timeFormat === 'relative')
      return formatDistanceToNow(parsed) + ` ${relativeLabel}`;

    return dateTz.formatInTimeZone(parsed, 'UTC', pattern);
  } catch {
    return '';
  }
}

export function timestampToDate(ts: Timestamp): Date {
  if (!isTimestamp(ts)) {
    throw new TypeError('provided value is not a timestamp');
  }

  const d = new Date(null);

  d.setTime(Number(ts.seconds) * 1000 + ts.nanos / 1000);

  return d;
}

function isTimestamp(arg: unknown): arg is Timestamp {
  if (typeof arg === 'object') {
    return arg['seconds'] !== undefined && arg['nanos'] !== undefined;
  }
  return false;
}

export function durationToString(
  duration: Duration | string,
  delimiter = ', ',
): string {
  if (duration === null || !duration) return '';
  if (typeof duration === 'string') duration = fromSeconds(duration);
  return formatDuration(duration, { delimiter });
}

function formatDistanceToSingleLetters(distance: string) {
  if (!distance) return '';
  distance = distance
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
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
}): Duration | null {
  if (!start || !end) return null;

  try {
    if (isTimestamp(start)) {
      start = timestampToDate(start);
    }

    if (isTimestamp(end)) {
      end = timestampToDate(end);
    }

    const parsedStart = parseJSON(start);
    const parsedEnd = parseJSON(end);

    const distance = intervalToDuration({ start: parsedStart, end: parsedEnd });
    return distance;
  } catch {
    return null;
  }
}

export function formatDistance({
  start,
  end,
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
}): string {
  const duration = getDuration({ start, end });
  return durationToString(duration);
}

export function formatDistanceAbbreviated({
  start,
  end,
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
}): string {
  const duration = getDuration({ start, end });
  const distance = durationToString(duration, ' ');
  return formatDistanceToSingleLetters(distance);
}

export function toMilliseconds(date: ValidTime | undefined | null): number {
  if (!date) return 0;
  if (isTimestamp(date)) {
    date = timestampToDate(date);
  }
  const parsedDate = parseJSON(date);

  return getMilliseconds(parsedDate);
}

export function fromSecondsToMinutesAndSeconds(seconds: number): string {
  if (!seconds) return '';
  const duration = intervalToDuration({
    start: 0,
    end: Math.floor(seconds) * 1000,
  });
  return formatDuration(duration, { format: ['minutes', 'seconds'] });
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
