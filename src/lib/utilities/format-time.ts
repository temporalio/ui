import {
  formatDuration as durationToString,
  getMilliseconds as getSecondAsMilliseconds,
  intervalToDuration,
  parseJSON,
} from 'date-fns';

import type { Timestamp } from '$lib/types';

import { has } from './has';
import { fromSeconds } from './to-duration';

export type ValidTime = Parameters<typeof parseJSON>[0] | Timestamp;

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

export function formatDuration(
  duration: Duration | string,
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
    if (isTimestamp(start)) {
      start = timestampToDate(start);
    }

    if (isTimestamp(end)) {
      end = timestampToDate(end);
    }

    const parsedStart = parseJSON(start);
    const parsedEnd = parseJSON(end);
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
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
  includeMilliseconds?: boolean;
  includeMillisecondsForUnderSecond?: boolean;
}): string {
  const duration = getDuration({ start, end });
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
}: {
  start: ValidTime | undefined | null;
  end: ValidTime | undefined | null;
  includeMilliseconds?: boolean;
  includeMillisecondsForUnderSecond?: boolean;
}): string {
  const duration = getDuration({ start, end });
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
  if (isTimestamp(date)) {
    date = timestampToDate(date);
  }
  const parsedDate = parseJSON(date);

  return getSecondAsMilliseconds(parsedDate);
}

export function fromSecondsToMinutesAndSeconds(seconds: number): string {
  if (!seconds) return '';
  const duration = intervalToDuration({
    start: 0,
    end: Math.floor(seconds) * 1000,
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
