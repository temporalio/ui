import { describe, expect, it } from 'vitest';

import {
  allocateCardWidths,
  applyFrozenWidths,
  CARD_GAP,
  freezeWidths,
  layoutSegments,
  MIN_CARD_WIDTH,
  steppedLiveDuration,
} from './card-layout';

const totalWidth = (widths: number[]) =>
  widths.reduce((sum, width) => sum + width, 0);

describe('allocateCardWidths', () => {
  it('returns nothing for no Runs', () => {
    expect(allocateCardWidths([], 1000)).toEqual([]);
  });

  it('fits the newest 4 Runs into the viewport in proportion to duration', () => {
    const widths = allocateCardWidths([10, 10, 20, 40], 1000);

    expect(totalWidth(widths) + CARD_GAP * 3).toBeCloseTo(1000);
    expect(widths[3] - MIN_CARD_WIDTH).toBeCloseTo(
      2 * (widths[2] - MIN_CARD_WIDTH),
    );
    expect(widths[0]).toBeCloseTo(widths[1]);
  });

  it('gives older Runs the same scale so they scroll', () => {
    const widths = allocateCardWidths([10, 10, 10, 10, 10, 10], 1000);
    const newestWidths = widths.slice(-4);

    expect(totalWidth(newestWidths) + CARD_GAP * 3).toBeCloseTo(1000);
    expect(widths[0]).toBeCloseTo(widths[5]);
  });

  it('never goes below the minimum width', () => {
    const widths = allocateCardWidths([0, 1, 1_000_000, 1], 300);

    for (const width of widths) {
      expect(width).toBeGreaterThanOrEqual(MIN_CARD_WIDTH);
    }
  });

  it('caps an older Run at one viewport', () => {
    const widths = allocateCardWidths([1_000_000, 1, 1, 1, 1], 800);

    expect(widths[0]).toBeLessThanOrEqual(800);
  });

  it('sizes the only Run to the viewport', () => {
    expect(allocateCardWidths([5], 600)).toEqual([600]);
  });

  it('splits the space evenly when every duration is zero', () => {
    const widths = allocateCardWidths([0, 0], 500);

    expect(widths[0]).toBeCloseTo(widths[1]);
    expect(totalWidth(widths) + CARD_GAP).toBeCloseTo(500);
  });
});

describe('layoutSegments', () => {
  it('places segments one gap apart from the offset', () => {
    const segments = layoutSegments(
      [100, 200],
      [
        { id: 'run-a', startMs: 0, endMs: 10, live: false },
        { id: 'run-b', startMs: 10, endMs: 10, live: false },
      ],
      42,
    );

    expect(segments).toEqual([
      { id: 'run-a', x: 42, width: 100, startMs: 0, endMs: 10, live: false },
      {
        id: 'run-b',
        x: 42 + 100 + CARD_GAP,
        width: 200,
        startMs: 10,
        endMs: 11,
        live: false,
      },
    ]);
  });
});

describe('steppedLiveDuration', () => {
  it('is zero under a second', () => {
    expect(steppedLiveDuration(999)).toBe(0);
  });

  it('rounds down to the last doubling', () => {
    expect(steppedLiveDuration(1_000)).toBe(1_000);
    expect(steppedLiveDuration(7_999)).toBe(4_000);
    expect(steppedLiveDuration(8_000)).toBe(8_000);
    expect(steppedLiveDuration(179_000)).toBe(128_000);
  });

  it('keeps every width fixed until the live Run doubles', () => {
    const widthsAt = (liveMs: number) =>
      allocateCardWidths(
        [10_000, 20_000, 30_000, steppedLiveDuration(liveMs)],
        1000,
      );

    expect(widthsAt(9_000)).toEqual(widthsAt(15_999));
    expect(widthsAt(16_000)[3]).toBeGreaterThan(widthsAt(15_999)[3]);
  });
});

describe('applyFrozenWidths', () => {
  const frozen = freezeWidths(
    ['run-a', 'run-b', 'run-c'],
    [200, 300, 400],
    900,
  );

  it('passes widths through when nothing is frozen', () => {
    expect(
      applyFrozenWidths(['run-a', 'run-b'], [1, 2], null, {
        viewportWidth: 900,
        latestRunId: 'run-b',
      }),
    ).toEqual([1, 2]);
  });

  it('keeps frozen widths for every Run but the Latest Run', () => {
    expect(
      applyFrozenWidths(['run-a', 'run-b', 'run-c'], [150, 150, 600], frozen, {
        viewportWidth: 900,
        latestRunId: 'run-c',
      }),
    ).toEqual([200, 300, 600]);
  });

  it('sizes Runs added since the freeze normally', () => {
    expect(
      applyFrozenWidths(
        ['run-0', 'run-a', 'run-b', 'run-c', 'run-d'],
        [160, 150, 150, 150, 170],
        frozen,
        { viewportWidth: 900, latestRunId: 'run-d' },
      ),
    ).toEqual([160, 200, 300, 400, 170]);
  });

  it('ignores a freeze taken at another viewport width', () => {
    expect(
      applyFrozenWidths(['run-a', 'run-b', 'run-c'], [150, 150, 600], frozen, {
        viewportWidth: 1200,
        latestRunId: 'run-c',
      }),
    ).toEqual([150, 150, 600]);
  });
});
