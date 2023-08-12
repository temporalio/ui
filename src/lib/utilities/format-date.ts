import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  parseISO,
  parseJSON,
} from 'date-fns';
import * as dateTz from 'date-fns-tz'; // `build` script fails on importing some of named CommonJS modules

import { type TimeFormat, Timezones } from '$lib/stores/time-format';

import { isTimestamp, timestampToDate, type ValidTime } from './format-time';

const pattern = 'yyyy-MM-dd z HH:mm:ss.SS';

export function formatDate(
  date: ValidTime | undefined | null,
  timeFormat: TimeFormat = 'UTC',
  options: {
    relative?: boolean;
    relativeLabel?: string;
    relativeStrict?: boolean;
  } = {},
): string {
  if (!date) return '';

  const {
    relative = false,
    relativeLabel = 'ago',
    relativeStrict = false,
  } = options;

  try {
    if (isTimestamp(date)) {
      date = timestampToDate(date);
    }

    const parsed = parseJSON(date);

    if (timeFormat === 'local') {
      if (relative)
        return relativeStrict
          ? formatDistanceToNowStrict(parsed) + ` ${relativeLabel}`
          : formatDistanceToNow(parsed) + ` ${relativeLabel}`;
      return dateTz.format(parsed, pattern);
    }
    const timezone = Timezones[timeFormat]?.zones[0] ?? 'UTC';
    return dateTz.formatInTimeZone(parsed, timezone, pattern);
  } catch {
    return '';
  }
}

export function formatDateTime(
  date: string,
  timeFormat: TimeFormat = 'UTC',
  options: {
    relative?: boolean;
    relativeLabel?: string;
  } = {},
): string {
  const { relative = false, relativeLabel = 'ago' } = options;
  try {
    const parsed = parseJSON(date);

    const pattern = parsed.getSeconds()
      ? 'yyyy-MM-dd HH:mm:ss a'
      : 'yyyy-MM-dd HH:mm a';

    if (timeFormat === 'local') {
      if (relative) return formatDistanceToNow(parsed) + ` ${relativeLabel}`;

      return dateTz.format(parsed, pattern);
    }

    return dateTz.formatInTimeZone(parsed, 'UTC', pattern);
  } catch {
    return `about ${date} ${relativeLabel}`;
  }
}

export function isValidDate(date: string): boolean {
  const d = parseISO(date);
  return d instanceof Date && !isNaN(d.getTime());
}

export function formatUTCOffset(
  offset: number | undefined,
  utc: string,
): string {
  if (offset === undefined) return '';
  if (offset === 0) return `${utc}±00:00`;
  const absoluteValue = Math.abs(offset);
  const formattedOffset =
    absoluteValue > 9 ? `${absoluteValue}:00` : `0${absoluteValue}:00`;
  if (offset > 0) return `${utc}+${formattedOffset}`;
  if (offset < 0) return `${utc}-${formattedOffset}`;
}
