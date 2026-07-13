import { describe, expect, it } from 'vitest';

import { getTimezoneOffsetRange } from './timezone';

describe('getTimezoneOffsetRange', () => {
  it('shows the standard/daylight pair for a DST zone', () => {
    expect(getTimezoneOffsetRange('America/New_York')).toBe(
      'GMT-05:00/GMT-04:00',
    );
  });

  it('normalizes bare GMT and pairs it with the daylight offset', () => {
    expect(getTimezoneOffsetRange('Europe/London')).toBe('GMT+00:00/GMT+01:00');
  });

  it('collapses to a single offset for a non-DST zone', () => {
    expect(getTimezoneOffsetRange('Asia/Kolkata')).toBe('GMT+05:30');
  });

  it('preserves 45-minute offsets', () => {
    expect(getTimezoneOffsetRange('Asia/Kathmandu')).toBe('GMT+05:45');
  });

  it('handles a 30-minute daylight shift', () => {
    expect(getTimezoneOffsetRange('Australia/Lord_Howe')).toBe(
      'GMT+10:30/GMT+11:00',
    );
  });

  it('preserves negative half-hour offsets', () => {
    expect(getTimezoneOffsetRange('Pacific/Marquesas')).toBe('GMT-09:30');
  });
});
