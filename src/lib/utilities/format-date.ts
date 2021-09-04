import { format, parseJSON } from 'date-fns';

import type { Timestamp } from '$types';

export function formatDate(date: Date | Timestamp | string | null): string {
  if (!date) return '';

  if (isTimestamp(date)) {
    date = tsToDate(date);
  }

  return format(parseJSON(date), 'MMMM dd, yyyy — h:mm a');
}

function tsToDate(ts: Timestamp): Date {
  if (!isTimestamp(ts)) {
    throw new TypeError('provided value is not a timestamp');
  }

  const d = new Date(null);
  d.setTime(Number(ts.seconds) * 1000 + ts.nanos / 1000);

  return d;
}

function isTimestamp(arg: any): arg is Timestamp {
  return arg.seconds !== undefined && arg.nanos !== undefined;
}
