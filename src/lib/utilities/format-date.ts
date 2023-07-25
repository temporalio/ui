import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  parseJSON,
} from 'date-fns';
import * as dateTz from 'date-fns-tz'; // `build` script fails on importing some of named CommonJS modules

import type { TimeFormat } from '$lib/types/global';

import { isTimestamp, timestampToDate, type ValidTime } from './format-time';

const pattern = 'yyyy-MM-dd z HH:mm:ss.SS';

export function formatDate(
  date: ValidTime | undefined | null,
  timeFormat: TimeFormat | string = 'UTC',
  options: { relativeLabel?: string; relativeStrict?: boolean } = {},
): string {
  if (!date) return '';

  const { relativeLabel = 'ago', relativeStrict = false } = options;

  try {
    if (isTimestamp(date)) {
      date = timestampToDate(date);
    }

    const parsed = parseJSON(date);

    if (timeFormat === 'local') return dateTz.format(parsed, pattern);
    if (timeFormat === 'relative')
      return relativeStrict
        ? formatDistanceToNowStrict(parsed) + ` ${relativeLabel}`
        : formatDistanceToNow(parsed) + ` ${relativeLabel}`;

    return dateTz.formatInTimeZone(parsed, 'UTC', pattern);
  } catch {
    return '';
  }
}

export function formatDateTime(
  date: string,
  timeFormat: TimeFormat | string = 'UTC',
  relativeLabel = 'ago',
): string {
  try {
    const parsed = parseJSON(date);

    const pattern = parsed.getSeconds()
      ? 'yyyy-MM-dd HH:mm:ss a'
      : 'yyyy-MM-dd HH:mm a';
    if (timeFormat === 'local') return dateTz.format(parsed, pattern);
    if (timeFormat === 'relative')
      return formatDistanceToNow(parsed) + ` ${relativeLabel}`;

    return dateTz.formatInTimeZone(parsed, 'UTC', pattern);
  } catch {
    return `about ${date} ${relativeLabel}`;
  }
}
