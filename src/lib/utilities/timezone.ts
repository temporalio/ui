import { enUS } from 'date-fns/locale';
import * as dateTz from 'date-fns-tz';

export const TIME_UNIT_OPTIONS = ['minutes', 'hours', 'days'];

export const BASE_TIME_FORMAT_OPTIONS = {
  LOCAL: 'local',
  UTC: 'UTC',
};

export type TimezoneInfo = {
  abbr: string;
  offset: number;
  zones: string[];
};

export type TimeFormatOption = {
  label: string;
  value: string;
} & Partial<TimezoneInfo>;

export type TimeFormatOptions = TimeFormatOption[];

type GroupedTimezones = { [key: string]: TimezoneInfo };

const getGroupedTimezones = (): GroupedTimezones => {
  return Intl.supportedValuesOf('timeZone').reduce(
    (acc: GroupedTimezones, timeZone: string) => {
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
    },
    {},
  );
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

export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getLocalTime(): string {
  const localTimezone = getLocalTimezone();
  const localOption = TimezoneOptions.find(({ zones }) =>
    zones?.includes(localTimezone),
  );
  return localOption
    ? `${localOption.label} (${localOption.abbr})`
    : localTimezone;
}

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
