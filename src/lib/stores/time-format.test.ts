import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import { setTimeFormat, timeFormat } from './time-format';

describe('time format store', () => {
  test('should return UTC as the default', () => {
    expect(get(timeFormat)).toBe('UTC');
  });

  describe('setTimeFormat', () => {
    test('sets the time format', () => {
      setTimeFormat('local');
      expect(get(timeFormat)).toBe('local');

      setTimeFormat('relative');
      expect(get(timeFormat)).toBe('relative');

      setTimeFormat('UTC');
      expect(get(timeFormat)).toBe('UTC');
    });
  });
});
