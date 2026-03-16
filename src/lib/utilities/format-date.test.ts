import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatDate,
  formatUTCOffset,
  getSelectedTimezone,
  getUTCString,
  isValidDate,
} from './format-date';
import { getLocalTime } from './timezone';

// // force GH action runners to use en-US and 12-hour clocks starting at 0:00
// but respect explicit hour12 option when provided
const DateTimeFormat = Intl.DateTimeFormat;
vi.spyOn(global.Intl, 'DateTimeFormat').mockImplementation((_, options) => {
  const hour12 = options?.hour12 !== undefined ? options.hour12 : true;
  const hourCycle = options?.hour12 !== undefined ? undefined : 'h11';
  return new DateTimeFormat('en-US', {
    ...options,
    hour12,
    ...(hourCycle && { hourCycle }),
  });
});

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
    expect(formatDate(date)).toEqual('Apr 13, 2022, 4:29:35.63 PM UTC');
  });

  it('should format other timezones', () => {
    expect(formatDate(date, 'Greenwich Mean Time')).toEqual(
      'Apr 13, 2022, 4:29:35.63 PM GMT',
    );
    expect(formatDate(date, 'Central Standard Time')).toEqual(
      'Apr 13, 2022, 11:29:35.63 AM CDT',
    );
  });

  it('should format already formatted strings', () => {
    expect(formatDate('2022-04-13 UTC 4:29:35.63 PM')).toEqual(
      'Apr 13, 2022, 4:29:35.63 PM UTC',
    );
  });

  it('should format local time', () => {
    expect(formatDate(date, 'local')).toEqual(
      'Apr 13, 2022, 4:29:35.63 PM UTC',
    );
  });

  it('should format relative local time', () => {
    expect(formatDate(date, 'local', { relative: true })).toContain('ago');
    const currentDate = new Date();
    const futureDate = currentDate.setDate(currentDate.getDate() + 1);
    expect(formatDate(futureDate, 'local', { relative: true })).toContain(
      'from now',
    );
  });

  it('timezone does not matter when switching to relative time', () => {
    expect(formatDate(date, 'UTC', { relative: true })).toContain('ago');
    expect(
      formatDate(date, 'Central Standard Time', { relative: true }),
    ).toContain('ago');
    expect(
      formatDate(date, 'Greenwich Mean Time', { relative: true }),
    ).toContain('ago');
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
      '4/13/22, 4:29:35.63 PM UTC',
    );
    expect(formatDate(date, 'utc', { format: 'medium' })).toEqual(
      'Apr 13, 2022, 4:29:35.63 PM UTC',
    );
    expect(formatDate(date, 'utc', { format: 'long' })).toEqual(
      'April 13, 2022 at 4:29:35.63 PM UTC',
    );
  });

  describe('hourFormat option', () => {
    it('should use 24-hour format when hourFormat is "24"', () => {
      const result = formatDate(date, 'UTC', { hourFormat: '24' });
      expect(result).toContain('16:29:35');
      expect(result).not.toContain('PM');
      expect(result).not.toContain('AM');
    });

    it('should use 12-hour format when hourFormat is "12"', () => {
      const result = formatDate(date, 'UTC', { hourFormat: '12' });
      expect(result).toContain('4:29:35');
      expect(result).toContain('PM');
    });

    it('should use system default when hourFormat is "system"', () => {
      const result = formatDate(date, 'UTC', { hourFormat: 'system' });
      // System default is mocked to be 12-hour format
      expect(result).toContain('4:29:35');
      expect(result).toContain('PM');
    });

    it('should default to system format when hourFormat is not specified', () => {
      const result = formatDate(date, 'UTC');
      // System default is mocked to be 12-hour format
      expect(result).toContain('4:29:35');
      expect(result).toContain('PM');
    });

    it('should work with 24-hour format in different timezones', () => {
      const result = formatDate(date, 'Central Standard Time', {
        hourFormat: '24',
      });
      expect(result).toContain('11:29:35');
      expect(result).not.toContain('AM');
      expect(result).not.toContain('PM');
    });

    it('should work with 12-hour format in different timezones', () => {
      const result = formatDate(date, 'Central Standard Time', {
        hourFormat: '12',
      });
      expect(result).toContain('11:29:35');
      expect(result).toContain('AM');
    });

    it('should work with different timestamp formats', () => {
      expect(
        formatDate(date, 'UTC', { format: 'short', hourFormat: '24' }),
      ).toContain('16:29:35');
      expect(
        formatDate(date, 'UTC', { format: 'long', hourFormat: '24' }),
      ).toContain('16:29:35');
    });

    it('should not affect relative time formatting', () => {
      const result = formatDate(date, 'local', {
        relative: true,
        hourFormat: '24',
      });
      expect(result).toContain('ago');
      expect(result).not.toContain(':');
    });

    it('should handle midnight correctly in 24-hour format', () => {
      const midnight = '2022-04-13T00:00:00.000Z';
      const result = formatDate(midnight, 'UTC', { hourFormat: '24' });
      expect(result).toContain('0:00:00');
      expect(result).not.toContain('12:00:00');
    });

    it('should handle noon correctly in 24-hour format', () => {
      const noon = '2022-04-13T12:00:00.000Z';
      const result = formatDate(noon, 'UTC', { hourFormat: '24' });
      expect(result).toContain('12:00:00');
      expect(result).not.toContain('PM');
    });
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
