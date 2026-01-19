import { get } from 'svelte/store';

import {
  differenceInHours,
  formatDistanceToNowStrict,
  parseISO,
  parseJSON,
} from 'date-fns';

import {
  BASE_TIME_FORMAT_OPTIONS,
  getTimezone,
  hourFormat,
  TimezoneOptions,
  Timezones,
} from '$lib/stores/time-format';

import { isTimestamp, timestampToDate, type ValidTime } from './format-time';

export type FormatDateOptions = {
  format?: TimestampFormat;
  relative?: boolean;
  relativeLabel?: string;
  flexibleUnits?: boolean;
};

export const timestampFormats: Record<
  string,
  Partial<Intl.DateTimeFormatOptions>
> = {
  short: {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    fractionalSecondDigits: 2,
    timeZoneName: 'short',
  },
  medium: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
    fractionalSecondDigits: 2,
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZoneName: 'short',
    fractionalSecondDigits: 2,
  },
} as const;

export type TimestampFormat = keyof typeof timestampFormats;

export function formatDate(
  date: ValidTime | undefined | null,
  timeFormat: string = BASE_TIME_FORMAT_OPTIONS.UTC,
  options: FormatDateOptions = {},
): string {
  if (!date) return '';

  try {
    if (isTimestamp(date)) {
      date = timestampToDate(date);
    }

    const currentDate = Date.now();
    const isFutureDate = new Date(date).getTime() - currentDate > 0;
    const {
      relative = false,
      relativeLabel = isFutureDate ? 'from now' : 'ago',
      flexibleUnits = false,
      format = 'medium',
    } = options;

    const parsed = parseJSON(new Date(date));

    let use12HourFormat: boolean | undefined = undefined; // default to system setting

    if (get(hourFormat) === '12') {
      use12HourFormat = true;
    } else if (get(hourFormat) === '24') {
      use12HourFormat = false;
    }

    if (timeFormat === BASE_TIME_FORMAT_OPTIONS.LOCAL) {
      if (relative) {
        return (
          formatDistanceToNowStrict(parsed, {
            ...(!flexibleUnits &&
              Math.abs(differenceInHours(currentDate, parsed)) > 24 && {
                unit: 'day',
              }),
          }) + ` ${relativeLabel}`
        );
      }

      return new Intl.DateTimeFormat(undefined, {
        ...timestampFormats[format],
        hour12: use12HourFormat,
      }).format(parsed);
    }

    const timeZone = getTimezone(timeFormat);
    return new Intl.DateTimeFormat(undefined, {
      ...timestampFormats[format],
      timeZone,
      hour12: use12HourFormat,
    }).format(parsed);
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
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

export function getSelectedTimezone(timeFormat: string): string {
  if (timeFormat === BASE_TIME_FORMAT_OPTIONS.LOCAL) return getLocalTime();

  const selectedTimezone = Timezones[timeFormat];
  if (selectedTimezone) return `${timeFormat} (${selectedTimezone.abbr})`;

  return timeFormat;
}

export function getUTCString({
  date = new Date(),
  hour = 0,
  minute = 0,
  second = 0,
}: {
  date?: Date;
  hour?: string | number;
  minute?: string | number;
  second?: string | number;
} = {}): string {
  const utcTime = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number(hour),
    Number(minute),
    Number(second),
  );
  return new Date(utcTime).toISOString();
}
