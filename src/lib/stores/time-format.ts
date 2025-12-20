import { startOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import * as dateTz from 'date-fns-tz';

import { persistStore } from '$lib/stores/persist-store';
import {
  getLocalTimezone,
  type TimestampFormat,
} from '$lib/utilities/format-date';

type TimeFormatTypes = 'relative' | 'absolute';

export const timestampFormat = persistStore<TimestampFormat>(
  'timestampFormat',
  'medium',
);

export const TIME_UNIT_OPTIONS = ['minutes', 'hours', 'days'];

export const BASE_TIME_FORMAT_OPTIONS = {
  LOCAL: 'local',
  UTC: 'UTC',
};
const DEFAULT_TIME_FORMAT = BASE_TIME_FORMAT_OPTIONS.LOCAL;
export const timeFormat = persistStore('timeFormat', DEFAULT_TIME_FORMAT);
export const timeFormatType = persistStore(
  'timeFormatType',
  'relative' as TimeFormatTypes,
);

export const relativeTime = persistStore('relativeTime', false);
export const relativeTimeDuration = persistStore('relativeTimeDuration', '');
export const relativeTimeUnit = persistStore(
  'relativeTimeUnit',
  TIME_UNIT_OPTIONS[0],
);

export const startDate = persistStore('startDate', startOfDay(new Date()));
export const startHour = persistStore('startHour', '');
export const startMinute = persistStore('startMinute', '');
export const startSecond = persistStore('startSecond', '');

export const endDate = persistStore('endDate', startOfDay(new Date()));
export const endHour = persistStore('endHour', '');
export const endMinute = persistStore('endMinute', '');
export const endSecond = persistStore('endSecond', '');

type TimezoneInfo = {
  abbr: string;
  offset: number;
  zones: string[];
};

type TimeFormatOption = {
  label: string;
  value: string;
} & Partial<TimezoneInfo>;

export type TimeFormatOptions = TimeFormatOption[];

const getGroupedTimezones = (): {
  [key: string]: TimezoneInfo;
} => {
  return Intl.supportedValuesOf('timeZone').reduce((acc, timeZone) => {
    const zonedTime = dateTz.utcToZonedTime(new Date(), timeZone);
    const zoneString = dateTz.format(zonedTime, 'zzzz', {
      timeZone,
      locale: enUS,
    });
    if (acc[zoneString]) {
      acc[zoneString].zones.push(timeZone);
    } else {
      const zoneAbbr = dateTz.format(zonedTime, 'z', {
        timeZone,
        locale: enUS,
      });
      const offset = Math.floor(
        (dateTz.getTimezoneOffset(timeZone) / (1000 * 60 * 60)) % 24,
      );
      acc[zoneString] = {
        abbr: zoneAbbr,
        offset,
        zones: [timeZone],
      };
    }
    return acc;
  }, {});
};

export const Timezones = getGroupedTimezones();

export const getAdjustedTimeformat = (value: string, timezones = Timezones) => {
  const descriptors = ['Summer', 'Standard', 'Daylight'];
  const currentDescriptorIndex = descriptors.findIndex((descriptor) =>
    new RegExp(`\\b${descriptor}\\b`, 'i').test(value),
  );

  if (currentDescriptorIndex === -1) return;
  const currentDescriptor = descriptors.splice(currentDescriptorIndex, 1)[0];
  for (let i = 0; i < descriptors.length; i++) {
    const adjustedValue = value.replace(
      new RegExp(`\\b${currentDescriptor}\\b`, 'i'),
      descriptors[i],
    );
    if (timezones[adjustedValue]) return adjustedValue;
  }
};

timeFormat.subscribe((value) => {
  if (Object.values(BASE_TIME_FORMAT_OPTIONS).includes(value)) return;
  if (!Timezones[value]) {
    const adjustedTimeformat = getAdjustedTimeformat(value);
    timeFormat.set(
      adjustedTimeformat ? adjustedTimeformat : DEFAULT_TIME_FORMAT,
    );
  }
});

export const TimezoneOptions: TimeFormatOptions = Object.entries(Timezones)
  .map(([key, value]: [string, TimezoneInfo]) => ({
    label: key,
    value: key,
    ...value,
  }))
  .sort((a, b) => {
    if (a.label > b.label) return 1;
    if (b.label > a.label) return -1;
    return 0;
  });

export const getTimezone = (timeFormat: string): string => {
  if (timeFormat === BASE_TIME_FORMAT_OPTIONS.LOCAL) return getLocalTimezone();
  return Timezones[timeFormat]?.zones[0] ?? timeFormat;
};

export const formatOffset = (offset: number) => {
  const formattedOffset = String(Math.abs(offset)).padStart(2, '0');
  return offset >= 0 ? `+${formattedOffset}:00` : `-${formattedOffset}:00`;
};

export const getUTCOffset = (timeFormat: string): string => {
  let offset: number | undefined = Timezones[timeFormat]?.offset;

  if (offset === undefined) {
    const timezone = getTimezone(timeFormat);
    const offsetInMilliseconds = dateTz.getTimezoneOffset(timezone);
    if (offsetInMilliseconds) {
      offset = offsetInMilliseconds / 1000 / 60 / 60;
    } else {
      offset = 0;
    }
  }
  return formatOffset(offset);
};
