import { format, parseJSON } from 'date-fns';

import type { Timestamp } from '$types';

export function formatDate(date: Date | Timestamp | string | null): string {
  if (!date) return '';

  if (isTimestamp(date)) {
    date = timestampToDate(date);
  }

  return format(parseJSON(date), 'h:mm:ss a O, E, MMM dd, yyyy');
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
