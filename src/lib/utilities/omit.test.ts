import { describe, expect, it } from 'vitest';

import { omit } from './omit';

describe('omit', () => {
  it('should remove a key from an object', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, 'b');

    expect(result).toEqual({ a: 1 });
  });

  it('should not modify an object if given an invalid key', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, 'c');

    expect(result).toEqual({ a: 1, b: 2 });
  });
});
