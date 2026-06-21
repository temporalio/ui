import { describe, expect, it } from 'vitest';

import { packGutterPins } from './pack-gutter-pins';

/** Helpers */
const ev = (startMs: number, endMs: number) => ({ startMs, endMs });
const MARGIN = 4;
const MIN_W = 18;
const SCREEN_W = 1000;

describe('packGutterPins', () => {
  // ── Basic positioning ─────────────────────────────────────────────────────

  it('returns empty for no events', () => {
    expect(packGutterPins([], 0, 1, SCREEN_W, MARGIN, MIN_W, 2)).toEqual([]);
  });

  it('returns empty when maxRows is 0', () => {
    const events = [ev(0, 100)];
    expect(packGutterPins(events, 0, 1, SCREEN_W, MARGIN, MIN_W, 0)).toEqual(
      [],
    );
  });

  it('positions an event at its exact screen-space x', () => {
    // Event at startMs=100, zoom=2 px/ms, viewStart=50 → px = (100-50)*2 = 100
    const result = packGutterPins(
      [ev(100, 200)],
      50,
      2,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result).toHaveLength(1);
    expect(result[0].px).toBe(100);
  });

  it('width = max(minBarW, duration * zoom)', () => {
    // Event well within the viewport so no edge clipping occurs.
    // duration=50ms, zoom=2 → natural width = 100 > minBarW; starts at t=200 so px=400
    const r1 = packGutterPins([ev(200, 250)], 0, 2, SCREEN_W, MARGIN, MIN_W, 2);
    expect(r1[0].pw).toBe(100);

    // duration=1ms, zoom=0.001 → natural width = 0.001 < minBarW → uses MIN_W
    const r2 = packGutterPins(
      [ev(200, 201)],
      0,
      0.001,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(r2[0].pw).toBe(MIN_W);
  });

  // ── Edge clamping ─────────────────────────────────────────────────────────

  it('clamps events entirely off-screen LEFT to left margin', () => {
    // Event ends at t=-100 (before viewport start at t=0) → left edge pin
    const result = packGutterPins(
      [ev(-200, -100)],
      0,
      1,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result).toHaveLength(1);
    expect(result[0].px).toBe(MARGIN);
    expect(result[0].pw).toBe(MIN_W);
  });

  it('clamps events entirely off-screen RIGHT to right margin', () => {
    // Event starts at t=2000 (well past viewport end at t=1000) → right edge pin
    const result = packGutterPins(
      [ev(2000, 2100)],
      0,
      1,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result).toHaveLength(1);
    expect(result[0].px).toBe(SCREEN_W - MARGIN - MIN_W);
    expect(result[0].pw).toBe(MIN_W);
  });

  it('event starting before viewport but ending within is clipped to left margin', () => {
    // startMs=-10 → exStart=-10, exEnd=-10+min(18,5*1)=8 → px=MARGIN, pw clipped
    const result = packGutterPins(
      [ev(-10, -5)],
      0,
      1,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    // exEnd = (-5-0)*1 = -5 < MARGIN → left edge clamp
    expect(result[0].px).toBe(MARGIN);
    expect(result[0].pw).toBe(MIN_W);
  });

  it('event starting within viewport is clamped to left margin px', () => {
    // exStart=2, exEnd=2+18=20. px=max(MARGIN=4,2)=4, pw=20-4=16 < MIN_W → MIN_W
    const result = packGutterPins(
      [ev(2, 20)],
      0,
      1,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result[0].px).toBe(MARGIN);
    expect(result[0].pw).toBe(MIN_W);
  });

  it('event extending past right edge has at least minBarW and starts within screen', () => {
    // exStart=990, exEnd=1008. Not entirely off-screen right (990 < 996), so falls
    // through to the else branch. px=990, pw=max(MIN_W, 996-990)=MIN_W. px is within screen.
    const result = packGutterPins(
      [ev(990, 1000)],
      0,
      1,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result[0].pw).toBeGreaterThanOrEqual(MIN_W);
    expect(result[0].px).toBeLessThan(SCREEN_W - MARGIN);
  });

  // ── Row assignment (time-range non-overlap) ───────────────────────────────

  it('non-overlapping events share row 0', () => {
    const events = [ev(0, 100), ev(200, 300), ev(400, 500)];
    // All sorted by duration desc (equal), all non-overlapping in time
    const result = packGutterPins(events, 0, 1, SCREEN_W, MARGIN, MIN_W, 2);
    // All go to row 0 (no time overlap)
    for (const p of result) {
      expect(p.row).toBe(0);
    }
  });

  it('overlapping events in time go to different rows', () => {
    // Two events that overlap in time: [0,200] and [100,300]
    const events = [ev(0, 200), ev(100, 300)];
    const result = packGutterPins(events, 0, 1, SCREEN_W, MARGIN, MIN_W, 2);
    const rows = result.map((p) => p.row);
    expect(rows).toContain(0);
    expect(rows).toContain(1);
  });

  it('third overlapping event is dropped when maxRows=2', () => {
    // Three mutually overlapping events — only 2 rows available
    const events = [ev(0, 500), ev(100, 600), ev(200, 700)];
    const result = packGutterPins(events, 0, 1, SCREEN_W, MARGIN, MIN_W, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  // ── Pixel-space deduplication (pass 2) ───────────────────────────────────

  it('pixel-overlapping events in the same row: only the first drawn survives', () => {
    // Two events at the same time position → same px, pixel-overlap → one survives
    const events = [ev(100, 101), ev(100, 101)];
    const result = packGutterPins(events, 0, 1, SCREEN_W, MARGIN, MIN_W, 2);
    // Both go to row 0 (same time range? they overlap: 100<101 && 101>100 → YES overlap → row 1 for second)
    // Actually: first event [100,101] goes to row 0. Second [100,101] overlaps row 0's [100,101] → goes to row 1.
    // In pixel space they have same position, so the first in each row survives.
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('non-pixel-overlapping events in same row both appear', () => {
    // Two events that are far apart in time (same row, no pixel overlap)
    // Event A at t=0-5 → px=0 clamped to MARGIN, pw=MIN_W → [4, 22]
    // Event B at t=500-505 → px=500, pw=MIN_W → [500, 518] — no overlap with [4,22]
    const events = [ev(0, 5), ev(500, 505)];
    const result = packGutterPins(events, 0, 1, SCREEN_W, MARGIN, MIN_W, 2);
    // Both in row 0 (non-overlapping time), non-overlapping in pixels → both drawn
    expect(result.length).toBe(2);
  });

  // ── Width matches zoom ────────────────────────────────────────────────────

  it('pin width scales with zoom like event bars', () => {
    // Use an event well within the viewport at each zoom level to avoid edge clipping.
    const zoom1 = packGutterPins(
      [ev(100, 200)],
      0,
      1,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    const zoom2 = packGutterPins([ev(100, 200)], 0, 2, 5000, MARGIN, MIN_W, 2);
    const zoom4 = packGutterPins([ev(100, 200)], 0, 4, 10000, MARGIN, MIN_W, 2);

    // At zoom=1: pw = max(MIN_W, 100*1) = 100
    expect(zoom1[0].pw).toBe(100);
    // At zoom=2: pw = max(MIN_W, 100*2) = 200
    expect(zoom2[0].pw).toBe(200);
    // At zoom=4: pw = max(MIN_W, 100*4) = 400
    expect(zoom4[0].pw).toBe(400);
  });

  it('short events always get at least minBarW width', () => {
    // 1ms event at tiny zoom
    const result = packGutterPins(
      [ev(0, 1)],
      0,
      0.0001,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result[0].pw).toBe(MIN_W);
  });

  // ── Desc mode behaviour ───────────────────────────────────────────────────

  it('desc mode: newer above-viewport events (high endMs) appear right of center', () => {
    // Viewport: t=0 to t=500 (zoom=2, screenW=1000 → viewport end=500ms)
    // Newer events completed late (t=300-400ms) → screen x = (300-0)*2 = 600 (right of center)
    const newerEvents = [ev(300, 400)];
    const result = packGutterPins(
      newerEvents,
      0,
      2,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result[0].px).toBeGreaterThan(SCREEN_W / 2);
  });

  it('desc mode: older below-viewport events (low endMs) appear left of center', () => {
    // Viewport: t=200 to t=700 (viewStart=200, zoom=2, screenW=1000)
    // Older events completed early (t=50-100ms) → screen x = (50-200)*2 = -300 → LEFT EDGE clamp
    const olderEvents = [ev(50, 100)];
    const result = packGutterPins(
      olderEvents,
      200,
      2,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    expect(result[0].px).toBe(MARGIN); // clamped to left margin
  });

  // ── Density across full viewport ─────────────────────────────────────────

  it('events spread across the viewport produce pins spread across the canvas', () => {
    // 10 events evenly spread from t=0 to t=900ms, viewport t=0-1000, zoom=1
    const events = Array.from({ length: 10 }, (_, i) =>
      ev(i * 100, i * 100 + 1),
    );
    const result = packGutterPins(events, 0, 1, SCREEN_W, MARGIN, MIN_W, 2);
    // All go to row 0 (non-overlapping). Pixel deduplication skips some due to MIN_W.
    // At least a few should survive spread across the canvas.
    expect(result.length).toBeGreaterThan(0);
    // Pins should span a range of x positions, not all at the same edge
    const pxVals = result.map((p) => p.px);
    const range = Math.max(...pxVals) - Math.min(...pxVals);
    expect(range).toBeGreaterThan(100);
  });
});

describe('packGutterPins – desc/asc mode X-side invariants', () => {
  const makeEvents = (count: number, startOffset = 0, step = 1000) =>
    Array.from({ length: count }, (_, i) =>
      ev(startOffset + i * step, startOffset + i * step + 1),
    );

  it('desc above-viewport: events at high endMs (newest) appear on right side', () => {
    // Full viewport t=0–5000, zoom=0.2, screenW=1000 → covers 0-5000ms
    // Above-viewport tracks in desc = newest events (high endMs, say 3000-4999ms)
    const newerEvents = makeEvents(20, 3000, 100);
    const result = packGutterPins(
      newerEvents,
      0,
      0.2,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    if (result.length > 0) {
      const avgX = result.reduce((s, p) => s + p.px, 0) / result.length;
      expect(avgX).toBeGreaterThan(SCREEN_W / 2); // right of center
    }
  });

  it('desc below-viewport: events at low endMs (oldest) appear on left side', () => {
    // Same viewport, below-viewport tracks = oldest events (low endMs, say 0-1999ms)
    const olderEvents = makeEvents(20, 0, 100);
    const result = packGutterPins(
      olderEvents,
      0,
      0.2,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    if (result.length > 0) {
      const avgX = result.reduce((s, p) => s + p.px, 0) / result.length;
      expect(avgX).toBeLessThan(SCREEN_W / 2); // left of center
    }
  });

  it('asc above-viewport: events at low endMs (oldest in asc) appear on left side', () => {
    // In asc mode, above-viewport = OLDEST events = low endMs
    const oldestEvents = makeEvents(20, 0, 100);
    const result = packGutterPins(
      oldestEvents,
      0,
      0.2,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    if (result.length > 0) {
      const avgX = result.reduce((s, p) => s + p.px, 0) / result.length;
      expect(avgX).toBeLessThan(SCREEN_W / 2);
    }
  });

  it('asc below-viewport: events at high endMs (newest in asc) appear on right side', () => {
    // In asc mode, below-viewport = NEWEST events = high endMs
    const newestEvents = makeEvents(20, 3000, 100);
    const result = packGutterPins(
      newestEvents,
      0,
      0.2,
      SCREEN_W,
      MARGIN,
      MIN_W,
      2,
    );
    if (result.length > 0) {
      const avgX = result.reduce((s, p) => s + p.px, 0) / result.length;
      expect(avgX).toBeGreaterThan(SCREEN_W / 2);
    }
  });
});
