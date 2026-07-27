import { describe, expect, it } from 'vitest';

import { isValidCronString } from './cron';

describe('isValidCronString', () => {
  it('returns true for valid cron expressions', () => {
    expect(isValidCronString('0 12 * * *')).toBe(true);
    expect(isValidCronString('* * * * *')).toBe(true);
    expect(isValidCronString('0 0 1 * *')).toBe(true);
    expect(isValidCronString('0 12 * * 1-5')).toBe(true);
  });

  it('returns true for cron aliases', () => {
    expect(isValidCronString('@daily')).toBe(true);
    expect(isValidCronString('@hourly')).toBe(true);
  });

  it('returns false for invalid expressions', () => {
    expect(isValidCronString('')).toBe(false);
    expect(isValidCronString('not a cron string')).toBe(false);
    expect(isValidCronString('foo bar baz qux quux')).toBe(false);
  });

  it('returns false for expressions containing "#"', () => {
    expect(isValidCronString('0 0 * * 1#2')).toBe(false);
    expect(isValidCronString('0 12 * * *#comment')).toBe(false);
  });
});
