import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import {
  formatOffset,
  getTimezone,
  getUTCOffset,
  relativeTime,
  timeFormat,
  type TimeFormat,
  Timezones,
} from './time-format';

describe('time format store', () => {
  test('should return UTC as the default timeFormat', () => {
    expect(get(timeFormat)).toBe('UTC');
  });
  test('should return false as the default for relativeTime', () => {
    expect(get(relativeTime)).toBe(false);
  });
});

describe('getTimezone', () => {
  test('should return the first zone for the specified time format in the Timezones object', () => {
    expect(getTimezone('Pacific Daylight Time')).toBe('America/Los_Angeles');
    expect(getTimezone('Greenwich Mean Time')).toBe('Africa/Abidjan');
  });

  test('should return the local timezone if the time format is local', () => {
    expect(getTimezone('local')).toBe('UTC');
  });

  test('should return the time format if the time format does not exist in the Timezones object', () => {
    expect(getTimezone('UTC')).toBe('UTC');
  });
});

describe('formatOffset', () => {
  test('should return a formatted offset for positive numbers', () => {
    expect(formatOffset(0)).toBe('+00:00');
    expect(formatOffset(1)).toBe('+01:00');
    expect(formatOffset(9)).toBe('+09:00');
    expect(formatOffset(12)).toBe('+12:00');
  });

  test('should return a formatted offset for negative numbers', () => {
    expect(formatOffset(-1)).toBe('-01:00');
    expect(formatOffset(-9)).toBe('-09:00');
    expect(formatOffset(-12)).toBe('-12:00');
  });
});

describe('getUTCOffset', () => {
  test('should return a formatted UTC offset for all Timezone options', () => {
    Object.entries(Timezones).forEach(([format, { offset }]) => {
      expect(getUTCOffset(format as TimeFormat)).toBe(formatOffset(offset));
    });
  });

  test('should return a formatted UTC offset for local', () => {
    expect(getUTCOffset('local')).toBe('+00:00');
  });

  test('should return a formatted UTC offset for a timezone', () => {
    expect(getUTCOffset('America/Denver' as TimeFormat)).toBe('-07:00');
  });
});
