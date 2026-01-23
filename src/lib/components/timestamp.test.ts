import { get } from 'svelte/store';

import { beforeEach, describe, expect, it } from 'vitest';

import {
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';

import { timestamp } from './timestamp.svelte';

describe('timestamp', () => {
  const date = '2022-04-13T16:29:35.630571Z';

  beforeEach(() => {
    timeFormat.set('UTC');
    relativeTime.set(false);
    timestampFormat.set('medium');
  });

  it('should format date with default settings', () => {
    const result = get(timestamp)(date);
    expect(result).toContain('Apr 13, 2022');
    expect(result).toContain('4:29:35');
  });

  it('should accept format override for short', () => {
    const result = get(timestamp)(date, { format: 'short' });
    expect(result).toMatch(/\d{2}[-/]\d{2}[-/]\d{2}/); // Matches date formats like 22-04-13 or 4/13/22
    expect(result).toContain('4:29:35');
  });

  it('should accept format override for long', () => {
    const result = get(timestamp)(date, { format: 'long' });
    expect(result).toContain('April 13, 2022');
    expect(result).toContain('4:29:35');
  });

  it('should return empty string for null', () => {
    expect(get(timestamp)(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(get(timestamp)(undefined)).toBe('');
  });

  it('should use UTC timezone by default', () => {
    const result = get(timestamp)(date);
    expect(result).toContain('UTC');
  });

  it('should respect timeFormat store when set to different timezone', () => {
    timeFormat.set('Central Standard Time');
    const result = get(timestamp)(date);
    expect(result).toContain('CDT');
    expect(result).toContain('11:29:35');
  });

  it('should respect timestampFormat store', () => {
    timestampFormat.set('short');
    const result = get(timestamp)(date);
    expect(result).toMatch(/\d{2}[-/]\d{2}[-/]\d{2}/); // Matches date formats like 22-04-13 or 4/13/22
  });

  it('should allow format override to take precedence over store', () => {
    timestampFormat.set('long');
    const result = get(timestamp)(date, { format: 'short' });
    expect(result).toMatch(/\d{2}[-/]\d{2}[-/]\d{2}/); // Short format
    expect(result).not.toContain('April'); // Long format uses full month name
  });

  it('should format already formatted strings', () => {
    const result = get(timestamp)('2022-04-13 UTC 4:29:35.63 PM');
    expect(result).toContain('Apr 13, 2022');
  });

  it('should handle relative time when relativeTime store is true', () => {
    timeFormat.set('local');
    relativeTime.set(true);
    const result = get(timestamp)(date);
    expect(result).toContain('ago');
  });

  it('should handle future dates with relative time', () => {
    timeFormat.set('local');
    relativeTime.set(true);
    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + 24 * 60 * 60 * 1000,
    ).toISOString();
    const result = get(timestamp)(futureDate);
    expect(result).toContain('from now');
  });

  it('should accept relative override to force relative time', () => {
    timeFormat.set('local');
    relativeTime.set(false);
    const result = get(timestamp)(date, { format: 'relative' });
    expect(result).toContain('ago');
  });

  it('should use timestampFormat store when relative override is used', () => {
    timeFormat.set('local');
    relativeTime.set(false);
    timestampFormat.set('medium');
    const result = get(timestamp)(date, { format: 'relative' });
    expect(result).toContain('ago');
  });

  it('should respect relativeTime store when using short/medium/long override', () => {
    timeFormat.set('local');
    relativeTime.set(true);
    const result = get(timestamp)(date, { format: 'short' });
    expect(result).toContain('ago');
  });
});
