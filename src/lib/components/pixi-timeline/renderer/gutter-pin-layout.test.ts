import { describe, expect, it } from 'vitest';

import { layoutGutterPins } from './gutter-pin-layout';

const BASE = {
  viewStartMs: 0,
  viewEndMs: 415_000,
  zoom: 0.002,
  screenW: 800,
  pinMargin: 4,
  minPinW: 14,
  maxRows: 2,
};

describe('layoutGutterPins', () => {
  it('returns empty array when events list is empty', () => {
    expect(layoutGutterPins([], BASE)).toHaveLength(0);
  });

  it('places a mid-viewport event at the correct x position', () => {
    // startMs=200_000 → x = 200_000 * 0.002 = 400px (center of 800px screen)
    const events = [{ startMs: 200_000, endMs: 201_000 }];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].px).toBeCloseTo(400, 0);
  });

  it('places a RIGHT-side event (newest desc track) on the RIGHT', () => {
    // Event near end of timeline: startMs=380_000 → x = 380_000 * 0.002 = 760px
    const events = [{ startMs: 380_000, endMs: 415_000 }];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].px).toBeGreaterThan(600); // definitively right-side
  });

  it('places a LEFT-side event (oldest asc track) on the LEFT', () => {
    // Event at start of timeline: startMs=1_000 → x = 1_000 * 0.002 = 2px → clamped to pinMargin=4
    const events = [{ startMs: 1_000, endMs: 2_000 }];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].px).toBeLessThan(30); // definitively left-side
  });

  it('clamps events that end before viewStartMs to the left edge', () => {
    // Entirely before viewport → should snap to pinMargin (left edge), not excluded.
    const events = [{ startMs: -5_000, endMs: -1_000 }];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].px).toBe(BASE.pinMargin);
    expect(result[0].pw).toBeGreaterThanOrEqual(BASE.minPinW);
  });

  it('clamps events that start after viewEndMs to the right edge', () => {
    // Entirely after viewport → should snap to near screenW-pinMargin, not excluded.
    const events = [{ startMs: 500_000, endMs: 600_000 }];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].px).toBeLessThanOrEqual(BASE.screenW - BASE.pinMargin);
  });

  it('clamps px to pinMargin for events starting before the viewport', () => {
    const events = [{ startMs: -100_000, endMs: 5_000 }];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].px).toBe(BASE.pinMargin);
  });

  it('enforces minPinW', () => {
    // Very short event: 1ms at zoom 0.002 → rawEnd - rawPx = 0.002px, far below minPinW
    const events = [{ startMs: 100_000, endMs: 100_001 }];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].pw).toBeGreaterThanOrEqual(BASE.minPinW);
  });

  it('packs two overlapping events into separate rows', () => {
    // Two events with the same start time → can't fit in the same row
    const events = [
      { startMs: 100_000, endMs: 200_000 },
      { startMs: 100_000, endMs: 200_000 },
    ];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(2);
    expect(result[0].row).toBe(0);
    expect(result[1].row).toBe(1);
  });

  it('skips a third event when all rows are full at that x position', () => {
    // Three events at the same time, maxRows=2 → third is dropped
    const events = [
      { startMs: 100_000, endMs: 200_000 },
      { startMs: 100_000, endMs: 200_000 },
      { startMs: 100_000, endMs: 200_000 },
    ];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(2);
  });

  it('allows a third event if it fits at a later x position', () => {
    // Row 0 ends at x~400 after event A, row 1 ends at x~400 after event B.
    // Event C starts at x~600 → fits in row 0.
    const events = [
      { startMs: 100_000, endMs: 200_000 }, // placed in row 0
      { startMs: 100_000, endMs: 200_000 }, // placed in row 1
      { startMs: 300_000, endMs: 320_000 }, // fits in row 0 after its pin ends
    ];
    const result = layoutGutterPins(events, BASE);
    expect(result).toHaveLength(3);
    expect(result[2].row).toBe(0);
  });

  it('top-gutter desc events within the viewport appear on the RIGHT side', () => {
    // Desc section = newest events, all clustered near end of timeline (rightmost)
    const descEvents = [
      { startMs: 390_000, endMs: 415_000 },
      { startMs: 400_000, endMs: 415_000 },
      { startMs: 405_000, endMs: 415_000 },
    ];
    const result = layoutGutterPins(descEvents, BASE);
    // All should be on the RIGHT half of the screen (px > 400)
    for (const r of result) {
      expect(r.px).toBeGreaterThan(400);
    }
  });

  it('bottom-gutter asc events within the viewport appear on the LEFT side', () => {
    // Asc section = oldest events, all clustered near start of timeline (leftmost)
    const ascEvents = [
      { startMs: 0, endMs: 5_000 },
      { startMs: 1_000, endMs: 6_000 },
      { startMs: 2_000, endMs: 7_000 },
    ];
    const result = layoutGutterPins(ascEvents, BASE);
    // All should be on the LEFT half of the screen (px < 400)
    for (const r of result) {
      expect(r.px).toBeLessThan(400);
    }
  });

  it('top-gutter desc events before the viewport clamp to left edge (showing "events to the left")', () => {
    // When user pans right past the desc section events, they appear at left edge.
    const viewPannedRight = {
      ...BASE,
      viewStartMs: 420_000,
      viewEndMs: 835_000,
    };
    const descEvents = [
      { startMs: 390_000, endMs: 415_000 }, // before viewport
      { startMs: 400_000, endMs: 415_000 },
    ];
    const result = layoutGutterPins(descEvents, viewPannedRight);
    // All should clamp to left edge
    for (const r of result) {
      expect(r.px).toBe(viewPannedRight.pinMargin);
    }
  });
});
