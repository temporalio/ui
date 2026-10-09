import { describe, expect, it } from 'vitest';

import { getTimeTicks, getTimeTickStep } from './time-viewport';

const originMs = 1723456789123;

describe('getTimeTickStep', () => {
  it.each([
    [10, 2],
    [100, 20],
    [1000, 200],
    [10000, 2000],
    [60000, 15000],
    [20 * 60000, 5 * 60000],
    [2 * 3600000, 30 * 60000],
    [10 * 86400000, 2 * 86400000],
    [1000 * 86400000, 200 * 86400000],
  ])('uses a readable interval for a %i ms viewport', (duration, expected) => {
    expect(
      getTimeTickStep({ startMs: originMs, endMs: originMs + duration }, 1000),
    ).toBe(expected);
  });

  it('adjusts the spacing to the visible width', () => {
    const viewport = { startMs: 0, endMs: 60000 };
    expect(getTimeTickStep(viewport, 300)).toBe(60000);
    expect(getTimeTickStep(viewport, 1800)).toBe(10000);
  });

  it('has a minimum interval of one millisecond', () => {
    expect(getTimeTickStep({ startMs: 0, endMs: 1 }, 1000)).toBe(1);
  });

  it('returns no interval for an empty viewport or zero width', () => {
    expect(getTimeTickStep({ startMs: 0, endMs: 0 }, 1000)).toBe(0);
    expect(getTimeTickStep({ startMs: 0, endMs: 1000 }, 0)).toBe(0);
  });
});

describe('getTimeTicks', () => {
  it('aligns ticks to the workflow origin rather than Unix time', () => {
    expect(
      getTimeTicks(
        { startMs: originMs, endMs: originMs + 20 * 60000 },
        1000,
        originMs,
      ),
    ).toEqual([0, 5, 10, 15, 20].map((minutes) => originMs + minutes * 60000));
  });

  it('includes the zero tick even when the viewport is narrower than one interval', () => {
    expect(
      getTimeTicks({ startMs: originMs, endMs: originMs + 100 }, 50, originMs),
    ).toEqual([originMs]);
  });

  it('keeps ticks aligned while panning and only returns visible ticks', () => {
    expect(
      getTimeTicks(
        { startMs: originMs + 100, endMs: originMs + 1100 },
        1000,
        originMs,
      ),
    ).toEqual([200, 400, 600, 800, 1000].map((ms) => originMs + ms));
  });

  it('preserves millisecond ticks for short workflows', () => {
    expect(
      getTimeTicks({ startMs: originMs, endMs: originMs + 10 }, 1000, originMs),
    ).toEqual([0, 2, 4, 6, 8, 10].map((ms) => originMs + ms));
  });

  it('returns no ticks when no interval is available', () => {
    expect(
      getTimeTicks({ startMs: originMs, endMs: originMs + 100 }, 0, originMs),
    ).toEqual([]);
  });
});
