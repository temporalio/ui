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
    expect(formatDate(date)).toEqual('Apr 13, 2022, 16:29:35.63 UTC');
  });

  it('should format other timezones', () => {
    expect(formatDate(date, 'Greenwich Mean Time')).toEqual(
      'Apr 13, 2022, 16:29:35.63 GMT',
    );
    expect(formatDate(date, 'Central Standard Time')).toEqual(
      'Apr 13, 2022, 11:29:35.63 CDT',
    );
    expect(formatDate(date, 'Pacific Daylight Time')).toEqual(
      'Apr 13, 2022, 09:29:35.63 PDT',
    );
  });

  it('should format already formatted strings', () => {
    expect(formatDate('2022-04-13 UTC 16:29:35.63')).toEqual(
      'Apr 13, 2022, 16:29:35.63 UTC',
    );
  });

  it('should format local time', () => {
    expect(formatDate(date, 'local')).toEqual('Apr 13, 2022, 16:29:35.63 UTC');
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
      'Apr 13, 2022, 16:29:35.63 UTC',
    );
  });

  it('should format relative local time with a custom label', () => {
    expect(
      formatDate(date, 'local', { relative: true, relativeLabel: 'custom' }),
    ).toContain('custom');
  });

  it('should format relative time with days instead of months for past dates if flexibleUnits is not enabled', () => {
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

  it('should format relative time with days instead of months for future dates if flexibleUnits is not enabled', () => {
    const currentDate = new Date();
    const futureDate = currentDate.setDate(currentDate.getDate() + 90);
    let formattedDate = formatDate(futureDate, 'local', {
      relative: true,
      flexibleUnits: true,
    });
    expect(formattedDate).toEqual('3 months from now');

    formattedDate = formatDate(futureDate, 'local', { relative: true });
    expect(formattedDate).toEqual('90 days from now');
  });

  it('should not format relative time with days if less than a day for past dates even if flexibleUnits is enabled', () => {
    const currentDate = new Date();
    const pastDate = currentDate.setHours(currentDate.getHours() - 23);
    let formattedDate = formatDate(pastDate, 'local', {
      relative: true,
      flexibleUnits: true,
    });
    expect(formattedDate).toEqual('23 hours ago');

    formattedDate = formatDate(pastDate, 'local', { relative: true });
    expect(formattedDate).toEqual('23 hours ago');
  });

  it('should not format relative time with days if less than a day for future dates even if flexibleUnits is enabled', () => {
    const currentDate = new Date();
    const futureDate = currentDate.setHours(currentDate.getHours() + 23);
    let formattedDate = formatDate(futureDate, 'local', {
      relative: true,
      flexibleUnits: true,
    });
    expect(formattedDate).toEqual('23 hours from now');

    formattedDate = formatDate(futureDate, 'local', { relative: true });
    expect(formattedDate).toEqual('23 hours from now');
  });

  it('supports different timestamps formats', () => {
    expect(formatDate(date, 'utc', { format: 'short' })).toEqual(
      '4/13/22, 16:29:35.63 UTC',
    );
    expect(formatDate(date, 'utc', { format: 'medium' })).toEqual(
      'Apr 13, 2022, 16:29:35.63 UTC',
    );
    expect(formatDate(date, 'utc', { format: 'long' })).toEqual(
      'April 13, 2022 at 4:29:35.63 PM UTC',
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
