import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import {
  formatOffset,
  getAdjustedTimeformat,
  getTimezone,
  getUTCOffset,
  relativeTime,
  timeFormat,
  Timezones,
} from './time-format';

describe('time format store', () => {
  test('should return local as the default timeFormat', () => {
    expect(get(timeFormat)).toBe('local');
  });
  test('should return false as the default for relativeTime', () => {
    expect(get(relativeTime)).toBe(false);
  });
});

describe('getTimezone', () => {
  test('should return the first zone for the specified time format in the Timezones object', () => {
    expect(getTimezone('Central Standard Time')).toBe('America/Bahia_Banderas');
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
      expect(getUTCOffset(format)).toBe(formatOffset(offset));
    });
  });

  test('should return a formatted UTC offset for local', () => {
    expect(getUTCOffset('local')).toBe('+00:00');
  });

  test('should return a formatted UTC offset for a timezone', () => {
    expect(getUTCOffset('America/Phoenix')).toBe('-07:00');
  });
});

describe('getAdjustedTimeformat', () => {
  test('should replace daylight with standard and vice versa', () => {
    expect(
      getAdjustedTimeformat('Mountain Daylight Time', {
        'Mountain Standard Time': { abbr: 'MST', offset: -7, zones: [] },
      }),
    ).toBe('Mountain Standard Time');
    expect(
      getAdjustedTimeformat('Mountain Standard Time', {
        'Mountain Daylight Time': { abbr: 'MDT', offset: -7, zones: [] },
      }),
    ).toBe('Mountain Daylight Time');
  });

  test('should replace standard with summer and vice versa', () => {
    expect(
      getAdjustedTimeformat('Central European Summer Time', {
        'Central European Standard Time': {
          abbr: 'GMT+1',
          offset: 1,
          zones: [],
        },
      }),
    ).toBe('Central European Standard Time');
    expect(
      getAdjustedTimeformat('Central European Standard Time', {
        'Central European Summer Time': { abbr: 'GMT+2', offset: 2, zones: [] },
      }),
    ).toBe('Central European Summer Time');
  });
});
