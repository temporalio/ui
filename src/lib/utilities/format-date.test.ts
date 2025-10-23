import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatDate,
  formatUTCOffset,
  getLocalTime,
  getSelectedTimezone,
  getUTCString,
  isValidDate,
} from './format-date';

describe('formatDate', () => {
  const date = '2022-04-13T16:29:35.630571Z';

  it('should return an empty string if no date is provided', () => {
    expect(formatDate(undefined)).toEqual('');
    expect(formatDate(null)).toEqual('');
  });

  it('should error if there is an invalid date', () => {
    const spy = vi.spyOn(console, 'error');
    formatDate('2022-04-13T16');
    expect(spy).toHaveBeenCalled();

    formatDate('5 minutes');
    expect(spy).toHaveBeenCalled();
  });

  it('should error if there is an invalid timezone', () => {
    const spy = vi.spyOn(console, 'error');
    formatDate(date, 'bogus');
    expect(spy).toHaveBeenCalled();
  });

  it('should default to UTC', () => {
    expect(formatDate(date)).toEqual('2022-04-13 UTC 16:29:35.63');
  });

  it('should format other timezones', () => {
    expect(formatDate(date, 'Greenwich Mean Time')).toEqual(
      '2022-04-13 GMT 16:29:35.63',
    );
    expect(formatDate(date, 'Central Standard Time')).toEqual(
      '2022-04-13 CDT 11:29:35.63',
    );
    expect(formatDate(date, 'Pacific Daylight Time')).toEqual(
      '2022-04-13 PDT 09:29:35.63',
    );
  });

  it('should format already formatted strings', () => {
    expect(formatDate('2022-04-13 UTC 16:29:35.63')).toEqual(
      '2022-04-13 UTC 16:29:35.63',
    );
  });

  it('should format local time', () => {
    expect(formatDate(date, 'local')).toEqual('2022-04-13 UTC 16:29:35.63');
  });

  it('should format relative local time', () => {
    expect(formatDate(date, 'local', { relative: true })).toContain('ago');
    const currentDate = new Date();
    const futureDate = currentDate.setDate(currentDate.getDate() + 1);
    expect(formatDate(futureDate, 'local', { relative: true })).toContain(
      'from now',
    );
  });

  it('should not format other timezones as relative', () => {
    expect(formatDate(date, 'UTC', { relative: true })).toEqual(
      '2022-04-13 UTC 16:29:35.63',
    );
  });

  it('should format relative local time with a custom label', () => {
    expect(
      formatDate(date, 'local', { relative: true, relativeLabel: 'custom' }),
    ).toContain('custom');
  });

  it('should format relative time with days instead of months if flexibleUnits is not enabled', () => {
    const currentDate = new Date();
    const pastDate = currentDate.setDate(currentDate.getDate() - 90);
    let formattedDate = formatDate(pastDate, 'local', {
      relative: true,
      flexibleUnits: true,
    });
    expect(formattedDate).toEqual('3 months ago');

    formattedDate = formatDate(pastDate, 'local', { relative: true });
    expect(formattedDate).toEqual('90 days ago');
  });

  it('should shorten format for local and other timezones', () => {
    expect(formatDate(date, 'local', { abbrFormat: true })).toEqual(
      '2022-04-13 16:29:35 PM',
    );
    expect(formatDate(date, 'utc', { abbrFormat: true })).toEqual(
      '2022-04-13 16:29:35 PM',
    );
  });

  it('should shorten format without seconds if there are none for local and other timezones', () => {
    const dateWithoutSeconds = '2022-04-13T16:29:00.630571Z';
    expect(
      formatDate(dateWithoutSeconds, 'local', { abbrFormat: true }),
    ).toEqual('2022-04-13 16:29 PM');
    expect(formatDate(dateWithoutSeconds, 'utc', { abbrFormat: true })).toEqual(
      '2022-04-13 16:29 PM',
    );
  });
});

describe('isValidDate', () => {
  it('should return true if the value is a valid Date', () => {
    expect(isValidDate('2022-04-13T11:29:32.633009Z')).toBe(true);
  });

  it('should return false if the value is not a valid Date', () => {
    expect(isValidDate('bogus')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});

describe('formatUTCOffset', () => {
  it('should return an empty string if the offset is undefined', () => {
    expect(formatUTCOffset(undefined, 'UTC')).toBe('');
  });

  it('should return the correct string if the offset is 0', () => {
    expect(formatUTCOffset(0, 'UTC')).toBe('UTC±00:00');
  });

  it('should return an empty string if the offset is positive', () => {
    expect(formatUTCOffset(3, 'UTC')).toBe('UTC+03:00');
  });

  it('should return an empty string if the offset is positive and double digits', () => {
    expect(formatUTCOffset(10, 'UTC')).toBe('UTC+10:00');
  });

  it('should return an empty string if the offset is negative', () => {
    expect(formatUTCOffset(-3, 'UTC')).toBe('UTC-03:00');
  });

  it('should return an empty string if the offset is negative and double digits', () => {
    expect(formatUTCOffset(-10, 'UTC')).toBe('UTC-10:00');
  });
});

describe('getLocalTime', () => {
  it('should get the local timezone', () => {
    expect(getLocalTime()).toBe('UTC');
  });
});

describe('getSelectedTimezone', () => {
  it('should get the abbreviation for the timezone', () => {
    expect(getSelectedTimezone('Mountain Standard Time')).toBe(
      'Mountain Standard Time (MST)',
    );
  });

  it('should get the local timezone', () => {
    expect(getSelectedTimezone('local')).toBe('UTC');
  });

  it('should return the time format if there is no matching timezone found', () => {
    expect(getSelectedTimezone('UTC')).toBe('UTC');
  });
});

describe('getUTCString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01').getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should default to 00:00 for the current date', () => {
    expect(getUTCString()).toBe('2020-01-01T00:00:00.000Z');
  });

  it('should return a string with hours, minutes, and seconds set', () => {
    expect(getUTCString({ hour: 1, minute: 1, second: 1 })).toBe(
      '2020-01-01T01:01:01.000Z',
    );
    expect(getUTCString({ hour: 1, minute: 61, second: 1 })).toBe(
      '2020-01-01T02:01:01.000Z',
    );
    expect(getUTCString({ hour: 1, minute: 1, second: 61 })).toBe(
      '2020-01-01T01:02:01.000Z',
    );
    expect(getUTCString({ hour: 25 })).toBe('2020-01-02T01:00:00.000Z');
  });
});
