import { describe, expect, it } from 'vitest';

import { formatUTCOffset, isValidDate } from './format-date';

describe('isValidDate', () => {
  it('should return true if the value is a valid Date', () => {
    expect(isValidDate('2022-04-13T11:29:32.633009Z')).toBe(true);
  });
  it('should return false if the value is not a valid Date', () => {
    expect(isValidDate('bogus')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});

describe('formatUTCOffset', () => {
  it('should return an empty string if the offset is undefined', () => {
    expect(formatUTCOffset(undefined, 'UTC')).toBe('');
  });

  it('should return the correct string if the offset is 0', () => {
    expect(formatUTCOffset(0, 'UTC')).toBe('UTC±00:00');
  });

  it('should return an empty string if the offset is positive', () => {
    expect(formatUTCOffset(3, 'UTC')).toBe('UTC+03:00');
  });

  it('should return an empty string if the offset is positive and double digits', () => {
    expect(formatUTCOffset(10, 'UTC')).toBe('UTC+10:00');
  });

  it('should return an empty string if the offset is negative', () => {
    expect(formatUTCOffset(-3, 'UTC')).toBe('UTC-03:00');
  });

  it('should return an empty string if the offset is negative and double digits', () => {
    expect(formatUTCOffset(-10, 'UTC')).toBe('UTC-10:00');
  });
});
