import { formatDistanceToNow, parseJSON } from 'date-fns';
import { format, formatInTimeZone } from 'date-fns-tz';

import type { Timestamp } from '$types';

type ValidTime = Parameters<typeof parseJSON>[0] | Timestamp;

const pattern = 'H:mm:ss:SS a O ccc, LLL do';

export function formatDate(
  date: ValidTime,
  timeFormat: TimeFormat = 'UTC',
): string {
  if (!date) return '';

  if (isTimestamp(date)) {
    date = timestampToDate(date);
  }

  const parsed = parseJSON(date);

  if (timeFormat === 'local') return format(parsed, pattern);
  if (timeFormat === 'relative') return formatDistanceToNow(parsed) + ' ago';

  return formatInTimeZone(parsed, 'UTC', pattern);
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
