import { describe, expect, it } from 'vitest';

import { getLabelX } from './label-placement';

describe('getLabelX', () => {
  it('left-aligns the label after the first node in a fitting gap', () => {
    expect(
      getLabelX(
        { left: 100, right: 400 },
        [
          { left: 100, right: 120 },
          { left: 380, right: 400 },
        ],
        100,
        0,
        500,
      ),
    ).toBe(124);
  });

  it('uses the earliest fitting gap instead of a wider gap farther right', () => {
    expect(
      getLabelX(
        { left: 100, right: 400 },
        [
          { left: 100, right: 120 },
          { left: 190, right: 210 },
          { left: 380, right: 400 },
        ],
        50,
        0,
        500,
      ),
    ).toBe(124);
  });

  it('does not use an inside gap occupied by an intermediate node', () => {
    expect(
      getLabelX(
        { left: 100, right: 300 },
        [
          { left: 100, right: 120 },
          { left: 190, right: 210 },
          { left: 280, right: 300 },
        ],
        100,
        100,
        400,
      ),
    ).toBe(308);
  });

  it('places outside labels on the side with room rather than clipping on the right', () => {
    expect(
      getLabelX(
        { left: 300, right: 390 },
        [
          { left: 300, right: 320 },
          { left: 370, right: 390 },
        ],
        80,
        0,
        400,
      ),
    ).toBe(212);
  });

  it('keeps the label at a viewport edge when the mark is out of view', () => {
    expect(getLabelX({ left: 0, right: 100 }, [], 50, 200, 200)).toBe(208);
    expect(getLabelX({ left: 500, right: 600 }, [], 50, 200, 200)).toBe(342);
  });
});
