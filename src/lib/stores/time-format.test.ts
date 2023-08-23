import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import { relativeTime, timeFormat } from './time-format';

describe('time format store', () => {
  test('should return UTC as the default timeFormat', () => {
    expect(get(timeFormat)).toBe('UTC');
  });
  test('should return false as the default for relativeTime', () => {
    expect(get(relativeTime)).toBe(false);
  });
});
