import { describe, expect, it } from 'vitest';

import { isValidDate } from './format-date';

describe('isValidDate', () => {
  it('should return true if the value is a valid Date', () => {
    expect(isValidDate('2022-04-13T11:29:32.633009Z')).toBe(true);
  });
  it('should return false if the value is not a valid Date', () => {
    expect(isValidDate('bogus')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});
