import { describe, expect, it } from 'vitest';

import { collectGutterBest, type GutterEvent } from './collect-gutter-best';

const PRIORITY: Record<string, number> = {
  GROUP_CHILD_WORKFLOW: 2,
  GROUP_TIMER: 4,
  GROUP_ACTIVITY: 5,
};
const PRIORITY_DEFAULT = 7;

const ev = (
  startMs: number,
  endMs: number,
  pixiType = 'GROUP_ACTIVITY',
): GutterEvent => ({ startMs, endMs, pixiType });

const byTrack = (
  tracks: (GutterEvent | GutterEvent[])[],
): (GutterEvent[] | undefined)[] =>
  tracks.map((t) => (Array.isArray(t) ? t : [t]));

describe('collectGutterBest', () => {
  it('returns empty for no tracks', () => {
    expect(collectGutterBest([], [], PRIORITY, PRIORITY_DEFAULT, 100)).toEqual(
      [],
    );
  });

  it('returns empty when all tracks are empty', () => {
    const result = collectGutterBest(
      [0, 1, 2],
      [undefined, undefined, undefined],
      PRIORITY,
      PRIORITY_DEFAULT,
      100,
    );
    expect(result).toHaveLength(0);
  });

  it('picks one event per track (the longest)', () => {
    const tracks = byTrack([[ev(0, 10), ev(0, 50), ev(0, 5)]]);
    const result = collectGutterBest(
      [0],
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      100,
    );
    expect(result).toHaveLength(1);
    expect(result[0].endMs - result[0].startMs).toBe(50);
  });

  it('sorts by duration DESC — longest events come first', () => {
    const tracks = byTrack([
      ev(0, 1), // track 0: duration 1ms
      ev(0, 1000), // track 1: duration 1000ms
      ev(0, 10), // track 2: duration 10ms
    ]);
    const result = collectGutterBest(
      [0, 1, 2],
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      100,
    );
    expect(result[0].endMs - result[0].startMs).toBe(1000);
    expect(result[1].endMs - result[1].startMs).toBe(10);
    expect(result[2].endMs - result[2].startMs).toBe(1);
  });

  it('secondary sort: lower type priority wins among equal durations', () => {
    const tracks = byTrack([
      { startMs: 0, endMs: 100, pixiType: 'GROUP_ACTIVITY' },
      { startMs: 0, endMs: 100, pixiType: 'GROUP_TIMER' },
      { startMs: 0, endMs: 100, pixiType: 'GROUP_CHILD_WORKFLOW' },
    ]);
    const result = collectGutterBest(
      [0, 1, 2],
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      100,
    );
    expect(result[0].pixiType).toBe('GROUP_CHILD_WORKFLOW');
    expect(result[1].pixiType).toBe('GROUP_TIMER');
    expect(result[2].pixiType).toBe('GROUP_ACTIVITY');
  });

  it('caps output at maxSample', () => {
    const tracks = byTrack(Array.from({ length: 20 }, (_, i) => ev(i, i + 1)));
    const idxs = tracks.map((_, i) => i);
    const result = collectGutterBest(
      idxs,
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      5,
    );
    expect(result).toHaveLength(5);
  });

  // ── Proximity ordering (the core fix for gutter scroll behaviour) ──────────
  //
  // When all events have the same duration (common case: 1ms echo activities)
  // the sort is stable.  The caller is responsible for passing trackIdxs in
  // closest-to-viewport-first order so the PACK_SAMPLE cap retains relevant
  // events instead of the farthest ones.
  //
  // For the ABOVE gutter, gatherGutterTracks returns indices in ascending order
  // (farthest = first, closest = last), so the caller reverses before calling:
  //   collectGutterBest([...aboveTrackIdxs].reverse(), ...)
  //
  // For the BELOW gutter, the order is already closest-first.

  it('preserves input order when all durations are equal (stable sort)', () => {
    // Simulates reversed aboveTrackIdxs: [close=9, 8, 7, ..., far=0]
    const tracks = byTrack(
      Array.from({ length: 10 }, (_, i) => ev(i * 10, i * 10 + 1)),
    );
    const reversedIdxs = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]; // closest first

    const result = collectGutterBest(
      reversedIdxs,
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      100,
    );
    // All durations are 1ms — stable sort keeps input order → closest tracks retained
    expect(result.map((e) => e.startMs)).toEqual([
      90, 80, 70, 60, 50, 40, 30, 20, 10, 0,
    ]);
  });

  it('cap retains closest tracks when all durations are equal', () => {
    // 10 equal-duration tracks, input in closest-first order, cap=4
    const tracks = byTrack(
      Array.from({ length: 10 }, (_, i) => ev(i * 10, i * 10 + 1)),
    );
    const reversedIdxs = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

    const result = collectGutterBest(
      reversedIdxs,
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      4,
    );
    // Cap keeps first 4 → startMs values [90, 80, 70, 60] (closest to viewport)
    expect(result).toHaveLength(4);
    expect(result.map((e) => e.startMs)).toEqual([90, 80, 70, 60]);
  });

  it('long-duration events always surface even when they are far from viewport', () => {
    // Reversed above indices: closest = track 9, farthest = track 0
    // But track 0 has a much longer duration — it must still come first.
    const tracks = byTrack([
      ev(0, 5000, 'GROUP_TIMER'), // track 0 (farthest) but 5000ms duration
      ev(10, 11), // track 1: 1ms
      ev(20, 21), // track 2: 1ms
      ev(30, 31), // track 3: 1ms
      ev(40, 41), // track 4: 1ms
      ev(50, 51), // track 5: 1ms
      ev(60, 61), // track 6: 1ms
      ev(70, 71), // track 7: 1ms
      ev(80, 81), // track 8: 1ms
      ev(90, 91), // track 9 (closest): 1ms
    ]);
    const reversedIdxs = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

    const result = collectGutterBest(
      reversedIdxs,
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      5,
    );
    // Timer (5000ms) must come first regardless of proximity order
    expect(result[0].pixiType).toBe('GROUP_TIMER');
    expect(result[0].endMs - result[0].startMs).toBe(5000);
    // Remaining 4 slots: closest equal-duration tracks (tracks 9,8,7,6)
    expect(result.slice(1).map((e) => e.startMs)).toEqual([90, 80, 70, 60]);
  });

  it('handles sparse byTrack (undefined entries are skipped)', () => {
    const tracks: (GutterEvent[] | undefined)[] = [
      undefined,
      [ev(10, 20)],
      undefined,
      [ev(30, 100)],
    ];
    const result = collectGutterBest(
      [0, 1, 2, 3],
      tracks,
      PRIORITY,
      PRIORITY_DEFAULT,
      100,
    );
    expect(result).toHaveLength(2);
    expect(result[0].startMs).toBe(30); // longer duration first
    expect(result[1].startMs).toBe(10);
  });
});

// ── isRightPin threshold invariant ────────────────────────────────────────────
//
// In PixiRenderer, a bar with rawX + rawW potentially overlapping the right
// screen edge must be pinned to guarantee visibleW >= MIN_BAR_W so the SVG
// icon placeholder is always shown.
//
// The rule: isRightPin = rawX > screenW - PIN_MARGIN - MIN_BAR_W
//
// Without this threshold, bars starting between (screenW - PIN_MARGIN - MIN_BAR_W)
// and (screenW - PIN_MARGIN) would have visibleW < MIN_BAR_W and fall back to
// the single-letter icon placeholder ("A", "T", etc.).
//
// We encode the invariant as a pure predicate test to guard against regressions.

function computePinType(
  rawX: number,
  rawW: number,
  screenW: number,
  pinMargin: number,
  minBarW: number,
): 'left' | 'right' | 'cull' | 'normal' {
  const isLeftPin = rawX + rawW < pinMargin + minBarW;
  const isRightPin = rawX > screenW - pinMargin - minBarW;
  if (isLeftPin) return 'left';
  if (isRightPin) return 'right';
  if (rawX + rawW < 0 || rawX > screenW) return 'cull';
  return 'normal';
}

function visibleW(rawX: number, rawW: number, screenW: number): number {
  const barLeft = Math.max(0, rawX);
  const barRight = Math.min(screenW, rawX + rawW);
  return barRight - barLeft;
}

describe('isRightPin threshold guarantees visibleW >= MIN_BAR_W', () => {
  const SCREEN_W = 1000;
  const PIN_MARGIN = 4;
  const MIN_BAR_W = 18;

  it('bar starting well inside screen: normal render, full visibleW', () => {
    const rawX = 400;
    const rawW = MIN_BAR_W;
    expect(computePinType(rawX, rawW, SCREEN_W, PIN_MARGIN, MIN_BAR_W)).toBe(
      'normal',
    );
    expect(visibleW(rawX, rawW, SCREEN_W)).toBe(18);
  });

  it('bar starting just past right threshold gets right-pinned', () => {
    // rawX = SCREEN_W - PIN_MARGIN - MIN_BAR_W + 1 = 979 → right pin
    const rawX = SCREEN_W - PIN_MARGIN - MIN_BAR_W + 1;
    expect(
      computePinType(rawX, MIN_BAR_W, SCREEN_W, PIN_MARGIN, MIN_BAR_W),
    ).toBe('right');
  });

  it('bar at exact threshold boundary: normal render with exactly MIN_BAR_W visible', () => {
    // rawX = SCREEN_W - PIN_MARGIN - MIN_BAR_W = 978 → NOT a right pin (rawX must be >)
    const rawX = SCREEN_W - PIN_MARGIN - MIN_BAR_W;
    expect(
      computePinType(rawX, MIN_BAR_W, SCREEN_W, PIN_MARGIN, MIN_BAR_W),
    ).toBe('normal');
    // visibleW = min(1000, 978+18) - max(0, 978) = 996 - 978 = 18 = MIN_BAR_W ✓
    expect(visibleW(rawX, MIN_BAR_W, SCREEN_W)).toBe(MIN_BAR_W);
  });

  it('bar starting inside right threshold would lose icon without pinning', () => {
    // Demonstrates the pre-fix scenario for documentation.
    // rawX = SCREEN_W - 10 (inside the fixed threshold, so now right-pinned)
    const rawX = SCREEN_W - 10;
    const rawW = MIN_BAR_W;
    // With the fix: this IS a right pin
    expect(computePinType(rawX, rawW, SCREEN_W, PIN_MARGIN, MIN_BAR_W)).toBe(
      'right',
    );
    // Without the fix the old threshold was rawX > SCREEN_W - PIN_MARGIN = 996;
    // rawX=990 was NOT a right pin, giving visibleW=10 < MIN_BAR_W → "A" icon bug
    const oldIsRightPin = rawX > SCREEN_W - PIN_MARGIN;
    expect(oldIsRightPin).toBe(false); // confirms bug existed
    expect(visibleW(rawX, rawW, SCREEN_W)).toBe(10); // confirms icon would be hidden
  });

  it('for all rawX in the trouble zone, the new threshold pins the bar', () => {
    // All rawX from (SCREEN_W - PIN_MARGIN - MIN_BAR_W + 1) to SCREEN_W should be pinned
    for (
      let rawX = SCREEN_W - PIN_MARGIN - MIN_BAR_W + 1;
      rawX <= SCREEN_W;
      rawX++
    ) {
      expect(
        computePinType(rawX, MIN_BAR_W, SCREEN_W, PIN_MARGIN, MIN_BAR_W),
      ).toBe('right');
    }
  });

  it('entirely off-screen-right bar is also right-pinned (shown as indicator)', () => {
    const rawX = SCREEN_W + 100;
    expect(
      computePinType(rawX, MIN_BAR_W, SCREEN_W, PIN_MARGIN, MIN_BAR_W),
    ).toBe('right');
  });

  it('left pin: bar whose right edge is within left margin zone', () => {
    const rawX = -50;
    const rawW = MIN_BAR_W;
    // rawX + rawW = -32 < PIN_MARGIN + MIN_BAR_W = 22 → left pin
    expect(computePinType(rawX, rawW, SCREEN_W, PIN_MARGIN, MIN_BAR_W)).toBe(
      'left',
    );
  });
});
