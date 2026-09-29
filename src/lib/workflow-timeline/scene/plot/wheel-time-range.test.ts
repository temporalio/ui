import { describe, expect, it } from 'vitest';

import { getWheelTimeRange } from './wheel-time-range';

const domain = { startMs: 0, endMs: 1000 };
const selection = { startMs: 200, endMs: 400 };
const options = {
  deltaX: 0,
  deltaY: -100,
  deltaMode: 0,
  trackWidth: 200,
  selection,
  domain,
  minDurationMs: 10,
  pinnedLive: false,
};

describe('getWheelTimeRange', () => {
  it('zooms around the center on vertical scroll', () => {
    const range = getWheelTimeRange(options);
    expect(range).not.toBeNull();
    expect((range?.startMs ?? 0) + (range?.endMs ?? 0)).toBeCloseTo(600);
    expect((range?.endMs ?? 0) - (range?.startMs ?? 0)).toBeLessThan(200);
  });

  it('keeps the right edge fixed when live-pinned', () => {
    const range = getWheelTimeRange({ ...options, pinnedLive: true });
    expect(range?.endMs).toBe(400);
  });

  it('pans on horizontal scroll, clamping at the domain edge', () => {
    expect(getWheelTimeRange({ ...options, deltaX: 50, deltaY: 0 })).toEqual({
      startMs: 250,
      endMs: 450,
    });
    expect(getWheelTimeRange({ ...options, deltaX: 1000, deltaY: 0 })).toEqual({
      startMs: 800,
      endMs: 1000,
    });
  });

  it('does not zoom past the allowed duration', () => {
    const range = getWheelTimeRange({ ...options, minDurationMs: 200 });
    expect(range).toBeNull();
  });
});
