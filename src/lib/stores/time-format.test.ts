import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import { getTimezone, relativeTime, timeFormat } from './time-format';

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
