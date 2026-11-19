import { describe, expect, it } from 'vitest';

import {
  allocateCardWidths,
  CARD_GAP,
  layoutSegments,
  liveCardWidth,
  MIN_CARD_WIDTH,
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

  it('keeps every width fixed while the live Latest Run grows', () => {
    const before = allocateCardWidths([10, 20, 30, 5], 1000, {
      latestIsLive: true,
    });
    const after = allocateCardWidths([10, 20, 30, 500], 1000, {
      latestIsLive: true,
    });

    expect(after).toEqual(before);
    expect(totalWidth(after) + CARD_GAP * 3).toBeCloseTo(1000);
  });

  it('gives the live Latest Run an equal share of the newest Runs', () => {
    const widths = allocateCardWidths([10, 20, 30, 5], 1000, {
      latestIsLive: true,
    });

    expect(widths[3]).toBeCloseTo((1000 - CARD_GAP * 3) / 4);
    expect(widths[3]).toBe(liveCardWidth(4, 1000));
    expect(widths[2] - MIN_CARD_WIDTH).toBeCloseTo(
      3 * (widths[0] - MIN_CARD_WIDTH),
    );
  });

  it('sizes the live Latest Run of a one-Run chain to the viewport', () => {
    expect(allocateCardWidths([5], 600, { latestIsLive: true })).toEqual([600]);
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

describe('liveCardWidth', () => {
  it('matches the slot a successor gets once it is the live Latest Run', () => {
    const successorWidths = allocateCardWidths([10, 20, 30, 40, 0], 1000, {
      latestIsLive: true,
    });

    expect(liveCardWidth(5, 1000)).toBe(successorWidths[4]);
  });

  it('never goes below the minimum width', () => {
    expect(liveCardWidth(4, 200)).toBe(MIN_CARD_WIDTH);
  });
});
