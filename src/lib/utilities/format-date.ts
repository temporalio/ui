import {
  formatDistanceToNow,
  parseJSON,
  formatDuration as durationToString,
  intervalToDuration,
  format,
} from 'date-fns';
import * as dateTz from 'date-fns-tz'; // `build` script fails on importing some of named CommonJS modules

import type { Timestamp } from '$types';
import { fromSeconds } from './to-duration';

type ValidTime = Parameters<typeof parseJSON>[0] | Timestamp;

const pattern = 'yyyy-MM-dd z HH:mm:ss.SS';

export function formatDate(
  date: ValidTime | undefined | null,
  timeFormat: TimeFormat = 'UTC',
): string {
  if (!date) return '';

  try {
    if (isTimestamp(date)) {
      date = timestampToDate(date);
    }

    const parsed = parseJSON(date);

    if (timeFormat === 'local') return dateTz.format(parsed, pattern);
    if (timeFormat === 'relative') return formatDistanceToNow(parsed) + ' ago';

    return dateTz.formatInTimeZone(parsed, 'UTC', pattern);
  } catch {
    return '';
  }
}

function timestampToDate(ts: Timestamp): Date {
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

export function formatDuration(
  duration: Duration | string,
  delimiter: string = ', ',
): string {
  if (duration === null) return '';
  if (typeof duration === 'string') duration = fromSeconds(duration);
  return durationToString(duration, { delimiter });
}

function formatDistanceToSingleLetters(distance: string) {
  if (!distance) return '';
  distance = distance.replace(/seconds/g, 'second');
  distance = distance.replace(/second/g, 's');
  distance = distance.replace(/ s/g, 's');
  distance = distance.replace(/minutes/g, 'minute');
  distance = distance.replace(/minute/g, 'm');
  distance = distance.replace(/ m/g, 'm');
  distance = distance.replace(/hours/g, 'hour');
  distance = distance.replace(/hour/g, 'h');
  distance = distance.replace(/ h/g, 'h');
  distance = distance.replace(/days/g, 'day');
  distance = distance.replace(/day/g, 'd');
  distance = distance.replace(/ d/g, 'd');
  distance = distance.replace(/weeks/g, 'week');
  distance = distance.replace(/week/g, 'w');
  distance = distance.replace(/ w/g, 'w');
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
  return formatDuration(duration, '');
}

export function formatDistanceAbbreviated({
  start,
  end,
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
}): string {
  const distance = formatDistance({ start, end });
  return formatDistanceToSingleLetters(distance);
}
