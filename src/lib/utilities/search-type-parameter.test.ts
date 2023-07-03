import { describe, expect, it } from 'vitest';

import { getSearchType, isValidSearchType } from './search-type-parameter';

const invalidInputs = {
  number: 24,
  null: null,
  undefined: undefined,
  array: [1, 2, 3],
  object: { foo: 'bar' },
  boolean: true,
};

describe('isValidSearchType', () => {
  for (const [type, value] of Object.entries(invalidInputs)) {
    it(`should return false if given a[n] ${type}`, () => {
      expect(isValidSearchType(value)).toBe(false);
    });
  }

  it(`should return false if given a string that is not "basic" or "advanced"`, () => {
    expect(isValidSearchType('bogus')).toBe(false);
  });
});

describe('getSearchType', () => {
  it('should return "basic" if the seach parameter is set to "basic"', () => {
    const url = new URL('https://temporal.io/?search=basic');
    expect(getSearchType(url)).toBe('basic');
  });

  it('should return "advanced" if the seach parameter is set to "advanced"', () => {
    const url = new URL('https://temporal.io/?search=advanced');
    expect(getSearchType(url)).toBe('advanced');
  });

  it('return "basic" if it is missing from the URL', () => {
    const url = new URL('https://temporal.io/');
    expect(getSearchType(url)).toBe('basic');
  });

  it('should set the search parameter if it is missing from the URL', () => {
    const url = new URL('https://temporal.io/');
    getSearchType(url);
    expect(url.search).toBe('?search=basic');
  });
});
