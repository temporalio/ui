import { describe, expect, it } from 'vitest';

import { getTimezoneOffsetRange } from './timezone';

describe('getTimezoneOffsetRange', () => {
  it('shows the standard/daylight pair for a DST zone', () => {
    expect(getTimezoneOffsetRange('America/New_York')).toBe(
      'UTC-05:00/UTC-04:00',
    );
  });

  it('normalizes bare UTC and pairs it with the daylight offset', () => {
    expect(getTimezoneOffsetRange('Europe/London')).toBe('UTC+00:00/UTC+01:00');
  });

  it('collapses to a single offset for a non-DST zone', () => {
    expect(getTimezoneOffsetRange('Asia/Kolkata')).toBe('UTC+05:30');
  });

  it('preserves 45-minute offsets', () => {
    expect(getTimezoneOffsetRange('Asia/Kathmandu')).toBe('UTC+05:45');
  });

  it('handles a 30-minute daylight shift', () => {
    expect(getTimezoneOffsetRange('Australia/Lord_Howe')).toBe(
      'UTC+10:30/UTC+11:00',
    );
  });

  it('preserves negative half-hour offsets', () => {
    expect(getTimezoneOffsetRange('Pacific/Marquesas')).toBe('UTC-09:30');
  });
});
