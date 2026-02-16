import {
  differenceInHours,
  formatDistanceToNowStrict,
  parseISO,
  parseJSON,
} from 'date-fns';

import {
  BASE_TIME_FORMAT_OPTIONS,
  getLocalTime,
  getTimezone,
  Timezones,
} from '$lib/utilities/timezone';

import { isTimestamp, timestampToDate, type ValidTime } from './format-time';

export type { ValidTime };

export type HourFormat = 'system' | '12' | '24';

export type FormatDateOptions = {
  format?: TimestampFormat;
  relative?: boolean;
  relativeLabel?: string;
  flexibleUnits?: boolean;
  hourFormat?: HourFormat;
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
  iso: {},
} as const;

export type TimestampFormat = keyof typeof timestampFormats;

/**
 * Determines if a given date/time value represents a future moment.
 * Handles ValidTime types including strings, numbers, Dates, and Timestamp objects.
 *
 * @param time - The time value to check (can be a string, Date, or Timestamp)
 * @returns true if the time is in the future, false otherwise (including null/undefined)
 */
export function isFuture(time: ValidTime | undefined | null): boolean {
  if (!time) return false;

  try {
    const date = isTimestamp(time) ? timestampToDate(time) : new Date(time);
    return date > new Date();
  } catch {
    return false;
  }
}

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

    const {
      relative = false,
      relativeLabel = isFuture(date) ? 'from now' : 'ago',
      flexibleUnits = false,
      format = 'medium',
      hourFormat = 'system',
    } = options;

    const currentDate = Date.now();

    const parsed = parseJSON(new Date(date));

    // Handle relative time first (takes precedence over format)
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

    // Handle ISO format
    if (format === 'iso') {
      return parsed.toISOString();
    }

    const hour12 =
      hourFormat === 'system' ? undefined : hourFormat === '12' ? true : false;

    const formatOptions = {
      ...timestampFormats[format],
      ...(hour12 !== undefined && { hour12 }),
    };

    if (timeFormat === BASE_TIME_FORMAT_OPTIONS.LOCAL) {
      return new Intl.DateTimeFormat(undefined, formatOptions).format(parsed);
    }

    const timeZone = getTimezone(timeFormat);
    return new Intl.DateTimeFormat(undefined, {
      ...formatOptions,
      timeZone,
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
