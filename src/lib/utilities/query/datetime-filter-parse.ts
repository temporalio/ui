import { startOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';

import { isDateTimeFilter } from './search-attribute-filter';

export type DateTimeComponents = {
  date: Date;
  hour: string;
  minute: string;
  second: string;
};

const emptyDateTime = (): DateTimeComponents => ({
  date: startOfDay(new Date()),
  hour: '',
  minute: '',
  second: '',
});

export function parseDateTimeFilter(
  isoString: string,
  timezone: string,
): DateTimeComponents {
  const zoned = utcToZonedTime(new Date(isoString), timezone);
  return {
    date: startOfDay(zoned),
    hour: String(zoned.getHours()),
    minute: String(zoned.getMinutes()),
    second: String(zoned.getSeconds()),
  };
}

function parseBetweenDates(value: string): [string, string] | null {
  const matches = value.match(/"([^"]+)"/g);
  if (matches?.[0] && matches?.[1]) {
    return [matches[0].replace(/"/g, ''), matches[1].replace(/"/g, '')];
  }
  return null;
}

export function getInitialDateTimes(
  filter: SearchAttributeFilter,
  timezone: string,
): { start: DateTimeComponents; end: DateTimeComponents } {
  if (isDateTimeFilter(filter) && filter.value) {
    if (filter.customDate && filter.value.includes('BETWEEN')) {
      const dates = parseBetweenDates(filter.value);
      if (dates) {
        return {
          start: parseDateTimeFilter(dates[0], timezone),
          end: parseDateTimeFilter(dates[1], timezone),
        };
      }
    } else if (!filter.customDate) {
      return {
        start: parseDateTimeFilter(filter.value, timezone),
        end: emptyDateTime(),
      };
    }
  }
  return { start: emptyDateTime(), end: emptyDateTime() };
}
