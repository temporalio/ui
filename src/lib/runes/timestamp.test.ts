import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';

import { timestamp } from './timestamp.svelte';

// Force GH action runners to use en-US and 12-hour clocks starting at 0:00
const DateTimeFormat = Intl.DateTimeFormat;
vi.spyOn(global.Intl, 'DateTimeFormat').mockImplementation(
  (_, options) =>
    new DateTimeFormat('en-US', { ...options, hour12: true, hourCycle: 'h11' }),
);

describe('timestamp rune', () => {
  const date = '2022-04-13T16:29:35.630571Z';

  beforeEach(() => {
    timeFormat.set('UTC');
    relativeTime.set(false);
    timestampFormat.set('medium');
  });

  it('should format date with default settings', () => {
    const result = timestamp(date);
    expect(result).toContain('Apr 13, 2022');
    expect(result).toContain('4:29:35');
    expect(result).toContain('PM');
  });

  it('should accept format override for short', () => {
    const result = timestamp(date, 'short');
    expect(result).toContain('4/13/22');
    expect(result).toContain('4:29:35');
  });

  it('should accept format override for long', () => {
    const result = timestamp(date, 'long');
    expect(result).toContain('April 13, 2022');
    expect(result).toContain('4:29:35');
  });

  it('should return empty string for null', () => {
    expect(timestamp(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(timestamp(undefined)).toBe('');
  });

  it('should use UTC timezone by default', () => {
    const result = timestamp(date);
    expect(result).toContain('UTC');
  });

  it('should respect timeFormat store when set to different timezone', () => {
    timeFormat.set('Central Standard Time');
    const result = timestamp(date);
    expect(result).toContain('CDT');
    expect(result).toContain('11:29:35');
  });

  it('should respect timestampFormat store', () => {
    timestampFormat.set('short');
    const result = timestamp(date);
    expect(result).toContain('4/13/22');
  });

  it('should allow format override to take precedence over store', () => {
    timestampFormat.set('long');
    const result = timestamp(date, 'short');
    expect(result).toContain('4/13/22');
    expect(result).not.toContain('April');
  });

  it('should format already formatted strings', () => {
    const result = timestamp('2022-04-13 UTC 4:29:35.63 PM');
    expect(result).toContain('Apr 13, 2022');
  });

  it('should handle relative time when relativeTime store is true', () => {
    timeFormat.set('local');
    relativeTime.set(true);
    const result = timestamp(date);
    expect(result).toContain('ago');
  });

  it('should handle future dates with relative time', () => {
    timeFormat.set('local');
    relativeTime.set(true);
    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + 24 * 60 * 60 * 1000,
    ).toISOString();
    const result = timestamp(futureDate);
    // Note: Currently shows "ago" for all relative times (future dates use negative values)
    // This simplified behavior was intentional per user decision
    expect(result).toContain('ago');
  });
});
