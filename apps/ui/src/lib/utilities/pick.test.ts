import { describe, expect, it } from 'vitest';

import { pick } from './pick';

describe('pick', () => {
  it('should only keep the keys specified', () => {
    const source = { a: 1, b: 2, c: 3 };
    expect(pick(source, 'a', 'c')).toEqual({ a: 1, c: 3 });
  });
});
