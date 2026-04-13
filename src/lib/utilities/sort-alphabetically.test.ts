import { describe, expect, it } from 'vitest';

import { sortAlphabetically } from './sort-alphabetically';

describe('sortAlphabetically', () => {
  it('sorts objects alphabetically by key', () => {
    const result = sortAlphabetically(
      [{ name: 'zebra' }, { name: 'apple' }, { name: 'mango' }],
      (item) => item.name,
    );
    expect(result.map((n) => n.name)).toEqual(['apple', 'mango', 'zebra']);
  });

  it('does not mutate the input', () => {
    const input = [{ name: 'b' }, { name: 'a' }];
    sortAlphabetically(input, (item) => item.name);
    expect(input.map((n) => n.name)).toEqual(['b', 'a']);
  });

  it('sorts case-insensitively via localeCompare', () => {
    const result = sortAlphabetically(
      [{ name: 'Banana' }, { name: 'apple' }],
      (item) => item.name,
    );
    expect(result[0].name).toBe('apple');
  });

  it('returns an empty array when given an empty list', () => {
    expect(sortAlphabetically([])).toEqual([]);
  });

  it('sorts plain strings with default key', () => {
    const result = sortAlphabetically(['cherry', 'apple', 'banana']);
    expect(result).toEqual(['apple', 'banana', 'cherry']);
  });
});
