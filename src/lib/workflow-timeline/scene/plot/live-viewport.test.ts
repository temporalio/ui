import { describe, expect, it } from 'vitest';

import {
  getBufferedPlotEndMs,
  getFollowAfterInteraction,
  getLiveScrollLeft,
  getViewportDuration,
  getWheelInteraction,
  isHorizontalPan,
} from './live-viewport';
import type { TimeRange } from './time-viewport';
import { getViewportStartMs } from './viewport-anchor';

describe('live zoom duration', () => {
  it.each([1, 100, 2000, 9999, 10000])(
    'limits ongoing workflows to at least ten seconds for requested %i ms',
    (requestedMs) => {
      expect(getViewportDuration(requestedMs, true)).toBe(10000);
    },
  );

  it('preserves wider live views', () => {
    expect(getViewportDuration(60000, true)).toBe(60000);
  });

  it('allows fine zoom for completed workflows', () => {
    expect(getViewportDuration(100, false)).toBe(100);
    expect(getViewportDuration(0.1, false)).toBe(1);
  });

  it('also respects the maximum render width constraint', () => {
    expect(getViewportDuration(100, true, 20000)).toBe(20000);
    expect(getViewportDuration(100, false, 500)).toBe(500);
  });
});

describe('live-follow interactions', () => {
  it('never enables following through panning, including reaching the right edge', () => {
    expect(getFollowAfterInteraction(false, 'pan', -100)).toBe(false);
    expect(getFollowAfterInteraction(false, 'pan', 100)).toBe(false);
  });

  it('preserves following during zooming without enabling it for a stationary viewport', () => {
    expect(getFollowAfterInteraction(true, 'zoom', -100)).toBe(true);
    expect(getFollowAfterInteraction(true, 'zoom', 100)).toBe(true);
    expect(getFollowAfterInteraction(false, 'zoom', -100)).toBe(false);
  });

  it.each([-100, 100])(
    'keeps live following enabled for vertical wheel delta %i',
    (deltaY) => {
      const interaction = getWheelInteraction(0, deltaY);
      expect(interaction).toBe('zoom');
      expect(getFollowAfterInteraction(true, interaction, 0)).toBe(true);
    },
  );

  it.each([-100, 100])(
    'pauses following only for leftward horizontal wheel delta %i',
    (deltaX) => {
      expect(getWheelInteraction(deltaX, 5)).toBe('pan');
      expect(
        getFollowAfterInteraction(true, getWheelInteraction(deltaX, 5), deltaX),
      ).toBe(deltaX > 0);
    },
  );
});

describe('directional live-follow panning', () => {
  it.each([1, 50, 200])(
    'preserves following when scrolling %i pixels into the right buffer',
    (offset) => {
      expect(getFollowAfterInteraction(true, 'pan', offset)).toBe(true);
      expect(getFollowAfterInteraction(true, 'pan', -offset)).toBe(false);
    },
  );

  it('preserves following when panning is clamped with no movement', () => {
    expect(getFollowAfterInteraction(true, 'pan', 0)).toBe(true);
  });
});

describe('isHorizontalPan', () => {
  it.each([1, 5, 50])(
    'ignores a vertical scroll with %i pixels of concurrent horizontal movement',
    (horizontalMovement) => {
      expect(isHorizontalPan(100, 100 + horizontalMovement, 0, 100)).toBe(
        false,
      );
      expect(isHorizontalPan(100, 100 - horizontalMovement, 100, 0)).toBe(
        false,
      );
    },
  );

  it('ignores vertical-only scrolling', () => {
    expect(isHorizontalPan(100, 100, 0, 100)).toBe(false);
  });

  it.each([-50, 50])(
    'recognizes horizontal-only panning by %i pixels',
    (delta) => {
      expect(isHorizontalPan(100, 100 + delta, 50, 50)).toBe(true);
    },
  );

  it('ignores subpixel rounding without user movement', () => {
    expect(isHorizontalPan(100, 100.4, 50, 50)).toBe(false);
  });
});

describe('getBufferedPlotEndMs', () => {
  it.each([0, 1000, 1001, 1100, 1500, 1999, 2000, 2001])(
    'buffers the live end at %i by 1000 through 1999 milliseconds',
    (endMs) => {
      const buffer = getBufferedPlotEndMs(endMs, true) - endMs;
      expect(buffer).toBeGreaterThanOrEqual(1000);
      expect(buffer).toBeLessThanOrEqual(1999);
    },
  );

  it('keeps the buffered end steady within a second bucket', () => {
    for (let endMs = 1001; endMs <= 2000; endMs += 1) {
      expect(getBufferedPlotEndMs(endMs, true)).toBe(3000);
    }
    expect(getBufferedPlotEndMs(2001, true)).toBe(4000);
  });

  it.each([0, 1000, 1001, 1500.5, 1999, 2000])(
    'preserves the exact closed end at %s',
    (endMs) => {
      expect(getBufferedPlotEndMs(endMs, false)).toBe(endMs);
    },
  );
});

describe('getLiveScrollLeft', () => {
  it('aligns the viewport with the actual live edge rather than the physical plot end', () => {
    const domain: TimeRange = { startMs: 1000, endMs: 8500 };
    const plotDomain: TimeRange = { startMs: 1000, endMs: 10000 };
    const contentWidth = 1800;
    const viewportWidth = 400;
    const scrollLeft = getLiveScrollLeft(
      domain,
      plotDomain,
      contentWidth,
      viewportWidth,
    );

    expect(scrollLeft).toBeCloseTo(1100);
    expect(scrollLeft).toBeLessThan(contentWidth - viewportWidth);
    expect(
      getViewportStartMs(scrollLeft, plotDomain, contentWidth) + 2000,
    ).toBeCloseTo(domain.endMs);
  });

  it('moves linearly at intermediate live timestamps in 100 millisecond steps', () => {
    const plotDomain: TimeRange = { startMs: 1000, endMs: 10000 };

    for (let step = 0; step <= 9; step += 1) {
      const domain: TimeRange = { startMs: 1000, endMs: 8000 + step * 100 };
      expect(getLiveScrollLeft(domain, plotDomain, 1800, 400)).toBeCloseTo(
        1000 + step * 20,
      );
    }
  });

  it('preserves scale and smooth movement across buffer chunks when width is proportional to plot span', () => {
    for (const endMs of [9900, 10000, 10001, 10100, 10900, 11000, 11001]) {
      const domain: TimeRange = { startMs: 1000, endMs };
      const plotDomain: TimeRange = {
        startMs: domain.startMs,
        endMs: getBufferedPlotEndMs(endMs, true),
      };
      const contentWidth = (plotDomain.endMs - plotDomain.startMs) * 0.2;
      const scrollLeft = getLiveScrollLeft(
        domain,
        plotDomain,
        contentWidth,
        400,
      );

      expect(scrollLeft).toBeCloseTo((endMs - domain.startMs) * 0.2 - 400);
      expect(
        getViewportStartMs(scrollLeft, plotDomain, contentWidth),
      ).toBeCloseTo(endMs - 2000);
    }
  });

  it('clamps negative scroll when the initial window exceeds the live history', () => {
    const domain: TimeRange = { startMs: 1000, endMs: 1500 };
    const plotDomain: TimeRange = { startMs: 1000, endMs: 3000 };

    expect(getLiveScrollLeft(domain, plotDomain, 400, 400)).toBe(0);
  });

  it('adjusts pixel scroll for an earlier domain while preserving the live time window', () => {
    const domain: TimeRange = { startMs: 1000, endMs: 8500 };
    const plotDomain: TimeRange = { startMs: 1000, endMs: 10000 };
    const earlierDomain: TimeRange = { startMs: -1000, endMs: domain.endMs };
    const earlierPlotDomain: TimeRange = { startMs: -1000, endMs: 10000 };
    const scrollLeft = getLiveScrollLeft(domain, plotDomain, 1800, 400);
    const earlierScrollLeft = getLiveScrollLeft(
      earlierDomain,
      earlierPlotDomain,
      2200,
      400,
    );

    expect(earlierScrollLeft - scrollLeft).toBeCloseTo(400);
    expect(getViewportStartMs(scrollLeft, plotDomain, 1800)).toBeCloseTo(6500);
    expect(
      getViewportStartMs(earlierScrollLeft, earlierPlotDomain, 2200),
    ).toBeCloseTo(6500);
  });

  it('respects the effective viewport duration when content width reaches its maximum', () => {
    const domain: TimeRange = { startMs: 1000, endMs: 100_000_500 };
    const plotDomain: TimeRange = {
      startMs: domain.startMs,
      endMs: getBufferedPlotEndMs(domain.endMs, true),
    };
    const contentWidth = 4_000_000;
    const viewportWidth = 800;
    const effectiveDuration =
      (viewportWidth / contentWidth) * (plotDomain.endMs - plotDomain.startMs);
    const scrollLeft = getLiveScrollLeft(
      domain,
      plotDomain,
      contentWidth,
      viewportWidth,
    );
    const startMs = getViewportStartMs(scrollLeft, plotDomain, contentWidth);

    expect(effectiveDuration).toBe(20_000.2);
    expect(startMs).toBeCloseTo(domain.endMs - effectiveDuration);
    expect(startMs + effectiveDuration).toBeCloseTo(domain.endMs);
    expect(scrollLeft).toBeLessThan(contentWidth - viewportWidth);
  });
});
