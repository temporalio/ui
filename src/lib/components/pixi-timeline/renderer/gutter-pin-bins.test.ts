import { describe, expect, it } from 'vitest';

import { binGutterPins } from './gutter-pin-bins';

const SCREEN_W = 1296;
const PIN_MARGIN = 4;
const N_BINS = 40;
const USABLE = SCREEN_W - 2 * PIN_MARGIN; // 1288

// Helpers to make events
const ev = (startMs: number, endMs = startMs + 1) => ({ startMs, endMs });

// Threshold: "left quarter" is x < SCREEN_W * 0.25 = 324
// "right quarter" is x > SCREEN_W * 0.75 = 972
const LEFT_QUARTER = SCREEN_W * 0.25;
const RIGHT_QUARTER = SCREEN_W * 0.75;

describe('binGutterPins — desc mode invariant', () => {
  const VIEW_START = 0;
  const VIEW_END = 414_000; // 6.9m full timeline (fit-all)

  it('returns empty array for no events', () => {
    expect(
      binGutterPins([], VIEW_START, VIEW_END, SCREEN_W, PIN_MARGIN, N_BINS),
    ).toEqual([]);
  });

  it('desc above-tracks: events near END of timeline cluster in right bins', () => {
    // Newest desc events completed near the end of the workflow
    const events = Array.from({ length: 60 }, (_, i) =>
      ev(403_000 + i * 100, 403_001 + i * 100),
    );
    const pins = binGutterPins(
      events,
      VIEW_START,
      VIEW_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    expect(pins.length).toBeGreaterThan(0);
    // All pins should be in the right portion of the canvas
    for (const p of pins) {
      expect(p.px).toBeGreaterThan(RIGHT_QUARTER);
    }
  });

  it('asc below-tracks: events near START of timeline cluster in left bins', () => {
    // Oldest asc events happened at the beginning of the workflow
    const events = Array.from({ length: 60 }, (_, i) =>
      ev(1_500 + i * 100, 1_501 + i * 100),
    );
    const pins = binGutterPins(
      events,
      VIEW_START,
      VIEW_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    expect(pins.length).toBeGreaterThan(0);
    // All pins should be in the left portion of the canvas
    for (const p of pins) {
      expect(p.px).toBeLessThan(LEFT_QUARTER);
    }
  });

  it('top-left is empty when desc above-tracks are at end of timeline', () => {
    const events = Array.from({ length: 60 }, () => ev(412_000, 412_001));
    const pins = binGutterPins(
      events,
      VIEW_START,
      VIEW_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    // No pin should land in the left quarter
    const leftPins = pins.filter((p) => p.px < LEFT_QUARTER);
    expect(leftPins).toHaveLength(0);
  });

  it('bottom-left has events when asc below-tracks are at start of timeline', () => {
    const events = Array.from({ length: 60 }, () => ev(1_500, 1_501));
    const pins = binGutterPins(
      events,
      VIEW_START,
      VIEW_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    const leftPins = pins.filter((p) => p.px < LEFT_QUARTER);
    expect(leftPins.length).toBeGreaterThan(0);
  });
});

describe('binGutterPins — asc mode invariant (reversed sort)', () => {
  const VIEW_START = 0;
  const VIEW_END = 414_000;

  it('in asc mode, desc below-tracks (now below in flipped view) are at right', () => {
    // In asc mode (flipped), desc tracks render at the BOTTOM.
    // Below-tracks = high actual index = asc section but rendered above desc section.
    // The desc events (rightmost in time) appear as below-gutter entries.
    const events = Array.from({ length: 60 }, () => ev(412_000, 412_001));
    const pins = binGutterPins(
      events,
      VIEW_START,
      VIEW_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    // These are desc events → should be on the RIGHT
    for (const p of pins) {
      expect(p.px).toBeGreaterThan(RIGHT_QUARTER);
    }
  });

  it('in asc mode, top-right is empty when asc above-tracks are at start of timeline', () => {
    // In asc mode, the above-tracks = asc section (oldest events, leftmost in time)
    const events = Array.from({ length: 60 }, () => ev(1_500, 1_501));
    const pins = binGutterPins(
      events,
      VIEW_START,
      VIEW_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    const rightPins = pins.filter((p) => p.px > RIGHT_QUARTER);
    expect(rightPins).toHaveLength(0);
  });
});

describe('binGutterPins — endMs positioning', () => {
  it('long-running above event lands at endMs, to the right of the visible event', () => {
    // Activity scheduled at 410s, completed at 424s (14s long).
    // Topmost visible event starts at 423s.
    // The gutter pin for the long-running event must appear at >= 423s so it
    // is to the right of (or aligned with) the visible event.
    const VP_START = 410_000;
    const VP_END = 465_000;

    const longRunning = { startMs: 410_000, endMs: 424_000 };
    const topVisible = { startMs: 423_000, endMs: 423_001 };

    const abovePins = binGutterPins(
      [longRunning],
      VP_START,
      VP_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    const visiblePins = binGutterPins(
      [topVisible],
      VP_START,
      VP_END,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );

    expect(abovePins.length).toBe(1);
    expect(visiblePins.length).toBe(1);
    expect(abovePins[0].px).toBeGreaterThanOrEqual(visiblePins[0].px);
  });

  it('uses endMs not centerMs for bin assignment', () => {
    // startMs=0, endMs=400_000 → centerMs would be 200_000 (50% → bin 20)
    // but endMs=400_000 → 96.6% → bin 38
    const ev1 = { startMs: 0, endMs: 400_000 };
    const pins = binGutterPins([ev1], 0, 414_000, SCREEN_W, PIN_MARGIN, N_BINS);
    expect(pins.length).toBe(1);
    // With endMs: bin = floor(400000/414000 * 40) = 38
    // px = PIN_MARGIN + 38 * (USABLE/N_BINS)
    const expectedBinPx = PIN_MARGIN + 38 * (USABLE / N_BINS);
    expect(pins[0].px).toBeCloseTo(expectedBinPx);
    // Must be in the right half, not the middle
    expect(pins[0].px).toBeGreaterThan(SCREEN_W * 0.5);
  });
});

describe('binGutterPins — binning behaviour', () => {
  it('produces at most nBins pins', () => {
    const events = Array.from({ length: 200 }, (_, i) =>
      ev(i * 2000, i * 2000 + 1),
    );
    const pins = binGutterPins(
      events,
      0,
      414_000,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    expect(pins.length).toBeLessThanOrEqual(N_BINS);
  });

  it('keeps the longest-duration event per bin', () => {
    // Two events with the same endMs (same bin) but different durations.
    // The longer-running one should win.
    const short = { startMs: 10_000, endMs: 10_500 }; // 500ms
    const long = { startMs: 0, endMs: 10_500 }; // 10500ms (same endMs → same bin)
    const pins = binGutterPins(
      [short, long],
      0,
      414_000,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    expect(pins.length).toBe(1);
    expect(pins[0].event).toBe(long);
  });

  it('clamps events before the viewport to left-edge bin', () => {
    const events = [ev(-100_000, -99_999)]; // way before viewport
    const pins = binGutterPins(
      events,
      0,
      414_000,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    expect(pins.length).toBe(1);
    expect(pins[0].px).toBe(PIN_MARGIN); // first bin = leftmost
  });

  it('clamps events after the viewport to right-edge bin', () => {
    const events = [ev(900_000, 900_001)]; // way after viewport
    const pins = binGutterPins(
      events,
      0,
      414_000,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    expect(pins.length).toBe(1);
    const lastBinPx = PIN_MARGIN + (N_BINS - 1) * (USABLE / N_BINS);
    expect(pins[0].px).toBeCloseTo(lastBinPx);
  });

  it('pin widths are positive and fit within the canvas', () => {
    const events = Array.from({ length: 60 }, (_, i) => ev(i * 10_000));
    const pins = binGutterPins(
      events,
      0,
      414_000,
      SCREEN_W,
      PIN_MARGIN,
      N_BINS,
    );
    for (const p of pins) {
      expect(p.pw).toBeGreaterThan(0);
      expect(p.px + p.pw).toBeLessThanOrEqual(SCREEN_W);
    }
  });
});
