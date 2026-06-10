import { describe, expect, it } from 'vitest';

import { getRawValue } from './get-raw-value';

const timing = { timezoneName: 'UTC' };

describe('getRawValue', () => {
  it('returns the cron string for a cron spec', () => {
    expect(
      getRawValue({ kind: 'cron', cronString: '0 12 * * *' }, timing),
    ).toBe('0 12 * * *');
  });

  it('returns the kind keyword for week, month, and interval specs', () => {
    expect(getRawValue({ kind: 'week' }, timing)).toBe('week');
    expect(getRawValue({ kind: 'month' }, timing)).toBe('month');
    expect(
      getRawValue({ kind: 'interval', interval: { interval: '60s' } }, timing),
    ).toBe('interval');
  });

  it('returns an empty string for frozen specs', () => {
    expect(getRawValue({ kind: 'frozen' }, timing)).toBe('');
  });

  it('returns an empty string when the spec fails validation', () => {
    expect(getRawValue({ kind: 'none' }, timing)).toBe('');
    expect(getRawValue({ kind: 'cron', cronString: 'invalid' }, timing)).toBe(
      '',
    );
  });

  it('returns an empty string when the timing fails validation', () => {
    expect(
      getRawValue(
        { kind: 'cron', cronString: '0 12 * * *' },
        { startTime: 'not-a-date' },
      ),
    ).toBe('');
  });
});
