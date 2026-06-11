import { describe, expect, it } from 'vitest';

import { getRawValue } from './get-raw-value';

describe('getRawValue', () => {
  it('returns the cron string for a cron spec', () => {
    expect(getRawValue({ kind: 'cron', cronString: '0 12 * * *' })).toBe(
      '0 12 * * *',
    );
  });

  it('returns an empty string for week, month, and interval specs', () => {
    expect(getRawValue({ kind: 'week' })).toBe('');
    expect(getRawValue({ kind: 'month' })).toBe('');
    expect(
      getRawValue({ kind: 'interval', interval: { interval: '60s' } }),
    ).toBe('');
  });

  it('returns an empty string for frozen specs', () => {
    expect(getRawValue({ kind: 'frozen' })).toBe('');
  });

  it('returns an empty string when the spec fails validation', () => {
    expect(getRawValue({ kind: 'none' })).toBe('');
    expect(getRawValue({ kind: 'cron', cronString: 'invalid' })).toBe('');
  });
});
