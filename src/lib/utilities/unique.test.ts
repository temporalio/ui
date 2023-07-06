import { describe, expect, it } from 'vitest';

import { unique } from './unique';

describe('unique', () => {
  it('should remove duplicate values from an array', () => {
    expect([1, 2, 2, 3].filter(unique)).toEqual([1, 2, 3]);
  });
});
