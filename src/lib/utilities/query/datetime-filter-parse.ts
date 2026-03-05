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

export function getInitialStart(
  filter: SearchAttributeFilter,
  timezone: string,
): DateTimeComponents {
  if (isDateTimeFilter(filter) && filter.value) {
    if (filter.customDate && filter.value.includes('BETWEEN')) {
      const matches = filter.value.match(/"([^"]+)"/g);
      if (matches?.[0])
        return parseDateTimeFilter(matches[0].replace(/"/g, ''), timezone);
    } else if (!filter.customDate) {
      return parseDateTimeFilter(filter.value, timezone);
    }
  }
  return emptyDateTime();
}

export function getInitialEnd(
  filter: SearchAttributeFilter,
  timezone: string,
): DateTimeComponents {
  if (
    isDateTimeFilter(filter) &&
    filter.value &&
    filter.customDate &&
    filter.value.includes('BETWEEN')
  ) {
    const matches = filter.value.match(/"([^"]+)"/g);
    if (matches?.[1])
      return parseDateTimeFilter(matches[1].replace(/"/g, ''), timezone);
  }
  return emptyDateTime();
}
