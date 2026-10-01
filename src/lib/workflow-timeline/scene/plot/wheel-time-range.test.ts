import { describe, expect, it } from 'vitest';

import { centerTimeRange, getWheelTimeRange } from './wheel-time-range';

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
};

describe('centerTimeRange', () => {
  it('centers the same-duration viewport at the clicked time', () => {
    expect(centerTimeRange(700, selection, domain)).toEqual({
      startMs: 600,
      endMs: 800,
    });
  });

  it('clamps the window at both timeline edges', () => {
    expect(centerTimeRange(0, selection, domain)).toEqual({
      startMs: 0,
      endMs: 200,
    });
    expect(centerTimeRange(1000, selection, domain)).toEqual({
      startMs: 800,
      endMs: 1000,
    });
  });
});

describe('getWheelTimeRange', () => {
  it('zooms around the center on vertical scroll', () => {
    const range = getWheelTimeRange(options);
    expect(range).not.toBeNull();
    expect((range?.startMs ?? 0) + (range?.endMs ?? 0)).toBeCloseTo(600);
    expect((range?.endMs ?? 0) - (range?.startMs ?? 0)).toBeLessThan(200);
  });

  it.each([-100, 100])(
    'keeps the right edge fixed at the end with zoom delta %i',
    (deltaY) => {
      const range = getWheelTimeRange({
        ...options,
        deltaY,
        selection: { startMs: 800, endMs: 1000 },
      });
      expect(range?.endMs).toBe(1000);
    },
  );

  it.each([-100, 100])(
    'keeps the left edge fixed at the start with zoom delta %i',
    (deltaY) => {
      const range = getWheelTimeRange({
        ...options,
        deltaY,
        selection: { startMs: 0, endMs: 200 },
      });
      expect(range?.startMs).toBe(0);
      expect(range?.endMs).not.toBe(200);
    },
  );

  it('anchors a fully fitted viewport to the start when zooming in', () => {
    const range = getWheelTimeRange({ ...options, selection: domain });
    expect(range?.startMs).toBe(0);
    expect(range?.endMs).toBeLessThan(domain.endMs);
  });

  it.each([
    { startMs: 0.5, endMs: 200.5, anchor: 0 },
    { startMs: 799.5, endMs: 999.5, anchor: 999.5 },
  ])(
    'tolerates subpixel edge offsets for $startMs',
    ({ startMs, endMs, anchor }) => {
      const range = getWheelTimeRange({
        ...options,
        selection: { startMs, endMs },
      });
      expect(anchor === 0 ? range?.startMs : range?.endMs).toBe(anchor);
    },
  );

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

  it('does not shrink a spacious initial window when zooming out on a new workflow', () => {
    expect(
      getWheelTimeRange({
        ...options,
        deltaY: 100,
        domain: { startMs: 0, endMs: 5000 },
        selection: { startMs: 0, endMs: 60000 },
      }),
    ).toBeNull();
  });

  it('zooms in without collapsing to the tiny loaded domain', () => {
    const range = getWheelTimeRange({
      ...options,
      domain: { startMs: 0, endMs: 5000 },
      selection: { startMs: 0, endMs: 60000 },
    });
    expect(range?.startMs).toBe(0);
    expect((range?.endMs ?? 0) - (range?.startMs ?? 0)).toBeGreaterThan(5000);
    expect((range?.endMs ?? 0) - (range?.startMs ?? 0)).toBeLessThan(60000);
  });

  it('stops live zoom at ten seconds while retaining the right anchor', () => {
    const liveOptions = {
      ...options,
      domain: { startMs: 0, endMs: 60000 },
      selection: { startMs: 48000, endMs: 60000 },
      minDurationMs: 10000,
      deltaY: -10000,
    };
    const range = getWheelTimeRange(liveOptions);
    expect(range).toEqual({ startMs: 50000, endMs: 60000 });
    expect(
      getWheelTimeRange({
        ...liveOptions,
        selection: { startMs: 50000, endMs: 60000 },
      }),
    ).toBeNull();
  });

  it('retains a ten-second minimum with less than ten seconds of history', () => {
    expect(
      getWheelTimeRange({
        ...options,
        domain: { startMs: 0, endMs: 2000 },
        selection: { startMs: 0, endMs: 12000 },
        minDurationMs: 10000,
        deltaY: -10000,
      }),
    ).toEqual({ startMs: 0, endMs: 10000 });
  });

  it('does not zoom past the allowed duration', () => {
    const range = getWheelTimeRange({ ...options, minDurationMs: 200 });
    expect(range).toBeNull();
  });
});
