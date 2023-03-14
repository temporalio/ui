import { formatDistanceToNow, parseJSON } from 'date-fns';
import * as dateTz from 'date-fns-tz'; // `build` script fails on importing some of named CommonJS modules

import { isTimestamp, timestampToDate, type ValidTime } from './format-time';

const dateFirst = 'yyyy-MM-dd z HH:mm:ss.SS';
const timeFirst = 'HH:mm:ss.SS z yyyy-MM-dd';

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

    if (timeFormat === 'local') return dateTz.format(parsed, dateFirst);
    if (timeFormat === 'relative')
      return formatDistanceToNow(parsed) + ` ${relativeLabel}`;

    return dateTz.formatInTimeZone(parsed, 'UTC', dateFirst);
  } catch {
    return '';
  }
}
