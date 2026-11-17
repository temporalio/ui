import { describe, expect, it } from 'vitest';

import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } from './time-units';

describe('time units', () => {
  it('builds each unit from the one below it', () => {
    expect(SECOND_MS).toBe(1_000);
    expect(MINUTE_MS).toBe(60_000);
    expect(HOUR_MS).toBe(3_600_000);
    expect(DAY_MS).toBe(86_400_000);
  });
});
