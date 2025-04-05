import { describe, expect, it } from 'vitest';

import { merge } from './merge';

describe('merge', () => {
  it('should overwrite keys if they are primitive values', () => {
    const first = { a: 1 };
    const second = { a: 2 };
    expect(merge(first, second)).toEqual({ a: 2 });
  });

  it('should concat values if they are arrays', () => {
    const first = { a: [1, 2] };
    const second = { a: [3, 4] };
    expect(merge(first, second)).toEqual({ a: [1, 2, 3, 4] });
  });

  it('should recursively traverse down objects', () => {
    const first = { a: { b: [1, 2] } };
    const second = { a: { b: [3, 4] } };
    expect(merge(first, second)).toEqual({ a: { b: [1, 2, 3, 4] } });
  });

  it('should retain keys from the first object that are not found on the second', () => {
    const first = { a: 1, b: 3 };
    const second = { a: 2 };
    expect(merge(first, second)).toEqual({ a: 2, b: 3 });
  });

  it('should apply keys from the second that are not found on the first', () => {
    const first = { a: 1 };
    const second = { a: 2, b: 3 };
    expect(merge(first, second)).toEqual({ a: 2, b: 3 });
  });
});
