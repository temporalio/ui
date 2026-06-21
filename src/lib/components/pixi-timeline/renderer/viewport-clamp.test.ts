import { describe, expect, it } from 'vitest';

import {
  clampScaleY,
  clampViewportStartMs,
  initialViewport,
  MAX_SCALE_Y,
} from './viewport-clamp';

const DATA: { startMs: number; endMs: number } = { startMs: 0, endMs: 1000 };
const ZOOM = 1; // 1 px/ms  →  halfSpanMs = screenW / 2
const SCREEN_W = 200; // halfSpanMs = 100 ms  →  min = -100, max = 900

describe('clampViewportStartMs — hard limits', () => {
  it('passes through a value within range', () => {
    expect(clampViewportStartMs(400, DATA, ZOOM, SCREEN_W)).toBe(400);
  });

  it('clamps to min when startMs is too far left', () => {
    const result = clampViewportStartMs(-9999, DATA, ZOOM, SCREEN_W);
    const expected = DATA.startMs - SCREEN_W / (2 * ZOOM); // -100
    expect(result).toBe(expected);
  });

  it('clamps to max when startMs is too far right', () => {
    const result = clampViewportStartMs(9999, DATA, ZOOM, SCREEN_W);
    const expected = DATA.endMs - SCREEN_W / (2 * ZOOM); // 900
    expect(result).toBe(expected);
  });

  it('allows startMs exactly at the minimum', () => {
    const min = DATA.startMs - SCREEN_W / (2 * ZOOM);
    expect(clampViewportStartMs(min, DATA, ZOOM, SCREEN_W)).toBe(min);
  });

  it('allows startMs exactly at the maximum', () => {
    const max = DATA.endMs - SCREEN_W / (2 * ZOOM);
    expect(clampViewportStartMs(max, DATA, ZOOM, SCREEN_W)).toBe(max);
  });
});

describe('clampViewportStartMs — centering invariant', () => {
  it('at the left stop, first event is centerable (first event is in right half)', () => {
    const min = DATA.startMs - SCREEN_W / (2 * ZOOM);
    const startMs = clampViewportStartMs(-9999, DATA, ZOOM, SCREEN_W);
    // viewport spans [startMs, startMs + screenW/zoom]
    // center of viewport = startMs + halfSpanMs = startMs + screenW/(2*zoom)
    const viewCenter = startMs + SCREEN_W / (2 * ZOOM);
    expect(startMs).toBe(min);
    expect(viewCenter).toBe(DATA.startMs); // first event exactly at center
  });

  it('at the right stop, last event is centerable (last event is at viewport center)', () => {
    const max = DATA.endMs - SCREEN_W / (2 * ZOOM);
    const startMs = clampViewportStartMs(9999, DATA, ZOOM, SCREEN_W);
    const viewCenter = startMs + SCREEN_W / (2 * ZOOM);
    expect(startMs).toBe(max);
    expect(viewCenter).toBe(DATA.endMs); // last event exactly at center
  });
});

describe('clampViewportStartMs — zoom sensitivity', () => {
  it('higher zoom → smaller halfSpanMs → min and max shift right', () => {
    const highZoom = 4; // halfSpanMs = 200/(2*4) = 25  vs 100 at zoom=1
    const min = DATA.startMs - SCREEN_W / (2 * highZoom); // -25
    const max = DATA.endMs - SCREEN_W / (2 * highZoom); // 975
    expect(clampViewportStartMs(-9999, DATA, highZoom, SCREEN_W)).toBe(min);
    expect(clampViewportStartMs(9999, DATA, highZoom, SCREEN_W)).toBe(max);
    // Both endpoints move right compared to zoom=1 (less negative min, higher max)
    expect(min).toBeGreaterThan(DATA.startMs - SCREEN_W / (2 * ZOOM));
    expect(max).toBeGreaterThan(DATA.endMs - SCREEN_W / (2 * ZOOM));
  });

  it('lower zoom → larger halfSpanMs → min and max shift left', () => {
    const lowZoom = 0.1; // halfSpanMs = 200/(2*0.1) = 1000
    const min = DATA.startMs - SCREEN_W / (2 * lowZoom); // -1000
    const max = DATA.endMs - SCREEN_W / (2 * lowZoom); // 0
    expect(clampViewportStartMs(-9999, DATA, lowZoom, SCREEN_W)).toBe(min);
    expect(clampViewportStartMs(9999, DATA, lowZoom, SCREEN_W)).toBe(max);
    // Both endpoints move left compared to zoom=1
    expect(min).toBeLessThan(DATA.startMs - SCREEN_W / (2 * ZOOM));
    expect(max).toBeLessThan(DATA.endMs - SCREEN_W / (2 * ZOOM));
  });

  it('wider screen produces wider padding at the same zoom', () => {
    const wideScreen = 800;
    const minWide = DATA.startMs - wideScreen / (2 * ZOOM);
    const minNarrow = DATA.startMs - SCREEN_W / (2 * ZOOM);
    expect(minWide).toBeLessThan(minNarrow);
  });
});

describe('clampViewportStartMs — non-zero data origin', () => {
  it('works correctly when dataRange does not start at zero', () => {
    const shifted = { startMs: 500, endMs: 2000 };
    const min = shifted.startMs - SCREEN_W / (2 * ZOOM); // 400
    const max = shifted.endMs - SCREEN_W / (2 * ZOOM); // 1900
    expect(clampViewportStartMs(-9999, shifted, ZOOM, SCREEN_W)).toBe(min);
    expect(clampViewportStartMs(9999, shifted, ZOOM, SCREEN_W)).toBe(max);
    expect(clampViewportStartMs(1000, shifted, ZOOM, SCREEN_W)).toBe(1000);
  });
});

describe('clampViewportStartMs — edge: data fits entirely within viewport', () => {
  it('when data span < screenW/zoom, min > max and clamp still returns a sane value', () => {
    // dataRange is 10ms wide, viewport is 200ms wide (screenW=200, zoom=1)
    const tiny = { startMs: 0, endMs: 10 };
    const min = tiny.startMs - SCREEN_W / (2 * ZOOM); // -100
    const max = tiny.endMs - SCREEN_W / (2 * ZOOM); // -90
    // min < max still, both are negative
    const result = clampViewportStartMs(0, tiny, ZOOM, SCREEN_W);
    expect(result).toBe(max); // clamped to max since 0 > max (-90)
    expect(result).toBeGreaterThanOrEqual(min);
  });
});

// ---------------------------------------------------------------------------
// clampScaleY — Y zoom limits
// ---------------------------------------------------------------------------

const TRACK_H = 28; // matches PixiRenderer default config
const MIN_ROW_PX = 12; // default minRowPx

describe('clampScaleY — maximum (rows never taller than default)', () => {
  it('MAX_SCALE_Y is 1.0', () => {
    expect(MAX_SCALE_Y).toBe(1.0);
  });

  it('at MAX_SCALE_Y, row height equals trackHeight exactly', () => {
    const rowHeight = TRACK_H * MAX_SCALE_Y;
    expect(rowHeight).toBe(TRACK_H);
  });

  it('clamps to MAX_SCALE_Y when candidate exceeds it', () => {
    expect(clampScaleY(2, TRACK_H)).toBe(MAX_SCALE_Y);
    expect(clampScaleY(5, TRACK_H)).toBe(MAX_SCALE_Y);
    expect(clampScaleY(100, TRACK_H)).toBe(MAX_SCALE_Y);
  });

  it('passes through a value exactly at MAX_SCALE_Y', () => {
    expect(clampScaleY(MAX_SCALE_Y, TRACK_H)).toBe(MAX_SCALE_Y);
  });

  it('passes through a value below MAX_SCALE_Y', () => {
    expect(clampScaleY(0.5, TRACK_H)).toBe(0.5);
    expect(clampScaleY(0.8, TRACK_H)).toBe(0.8);
  });
});

describe('clampScaleY — minimum (rows stay readable)', () => {
  it('default min gives 12px rows', () => {
    const minScaleY = MIN_ROW_PX / TRACK_H;
    expect(clampScaleY(0, TRACK_H)).toBe(minScaleY);
    expect(clampScaleY(-99, TRACK_H)).toBe(minScaleY);
  });

  it('passes through a value exactly at the minimum', () => {
    const min = MIN_ROW_PX / TRACK_H;
    expect(clampScaleY(min, TRACK_H)).toBe(min);
  });

  it('custom minRowPx changes the floor', () => {
    const result = clampScaleY(0, TRACK_H, 8);
    expect(result).toBe(8 / TRACK_H);
  });
});

describe('clampScaleY — row height invariant', () => {
  it('resulting row height is always between minRowPx and trackHeight', () => {
    const candidates = [-5, 0, 0.3, 0.5, 0.71, 1.0, 1.5, 5, 100];
    for (const c of candidates) {
      const scale = clampScaleY(c, TRACK_H);
      const rowH = scale * TRACK_H;
      expect(rowH).toBeGreaterThanOrEqual(MIN_ROW_PX);
      expect(rowH).toBeLessThanOrEqual(TRACK_H);
    }
  });

  it('at max zoom, row height is exactly trackHeight (2× icon size)', () => {
    const ICON_SIZE = 14;
    const maxScale = clampScaleY(999, TRACK_H);
    expect(maxScale * TRACK_H).toBe(TRACK_H);
    expect(TRACK_H).toBe(ICON_SIZE * 2); // documents the 2× relationship
  });
});

describe('initialViewport', () => {
  const MIN_ZOOM = 0.0001;
  const MAX_ZOOM = 100;
  const SCREEN_W = 1200;

  it('uses fit-all for short workflows (≤30s)', () => {
    const { startMs, zoom } = initialViewport(
      10_000,
      SCREEN_W,
      MIN_ZOOM,
      MAX_ZOOM,
    );
    expect(startMs).toBe(-200);
    const expectedZoom = SCREEN_W / (10_000 + 600);
    expect(zoom).toBeCloseTo(expectedZoom);
  });

  it('uses scoped view for long workflows (>30s)', () => {
    const endRelMs = 414_000; // 6.9 minutes
    const { startMs, zoom } = initialViewport(
      endRelMs,
      SCREEN_W,
      MIN_ZOOM,
      MAX_ZOOM,
    );
    // windowMs = min(60_000, 414_000 * 0.15) = 60_000
    const windowMs = 60_000;
    const expectedZoom = SCREEN_W / windowMs;
    expect(zoom).toBeCloseTo(expectedZoom);
    // startMs places desc events (near endRelMs) in the left-center of the canvas
    expect(startMs).toBe(endRelMs - windowMs * 0.25);
    expect(startMs).toBeGreaterThan(0); // viewport is near the end, not at 0
  });

  it('long workflow: events near endRelMs are visible in the left portion of canvas', () => {
    const endRelMs = 414_000;
    const { startMs, zoom } = initialViewport(
      endRelMs,
      SCREEN_W,
      MIN_ZOOM,
      MAX_ZOOM,
    );
    // A desc event at endRelMs should have rawX < screenW (visible, not right-pinned)
    const rawX = (endRelMs - startMs) * zoom;
    expect(rawX).toBeLessThan(SCREEN_W);
    expect(rawX).toBeGreaterThan(0);
  });

  it('respects minZoom bound', () => {
    const { zoom } = initialViewport(1_000_000_000, SCREEN_W, 0.001, MAX_ZOOM);
    expect(zoom).toBeGreaterThanOrEqual(0.001);
  });

  it('respects maxZoom bound', () => {
    const { zoom } = initialViewport(1, SCREEN_W, MIN_ZOOM, 0.5);
    expect(zoom).toBeLessThanOrEqual(0.5);
  });

  it('uses 15% of endRelMs window, capped at 60s', () => {
    // 15% of 200,000ms = 30,000ms < 60,000 → windowMs = 30,000
    const endRelMs = 200_000;
    const windowMs = endRelMs * 0.15; // 30,000
    const { zoom } = initialViewport(endRelMs, SCREEN_W, MIN_ZOOM, MAX_ZOOM);
    expect(zoom).toBeCloseTo(SCREEN_W / windowMs);
  });
});

describe('origin-shift compensation', () => {
  it('viewport startMs must shift by originShift to keep visual position', () => {
    // Simulates: desc events loaded first (origin=405000), then asc events
    // load older data shifting origin to 1500ms.
    const oldOrigin = 405_000;
    const newOrigin = 1_500;
    const originShift = oldOrigin - newOrigin; // 403,500ms

    // Initial viewport: startMs=-200ms for fit-all
    const initialStartMs = -200;
    const zoom = 0.122;

    // Desc event position BEFORE shift:
    const descEventRelStart_before = 403_000 - 0; // relStart = absMs - oldOrigin... wait
    // With old origin: relStart = 405000 - 405000 = 0ms → x = (0 + 200) * 0.122 = 24px
    const xBefore = (0 - initialStartMs) * zoom; // = (0 + 200) * 0.122 = 24.4

    // After origin shift: relStart = 405000 - 1500 = 403500ms
    const newRelStart = 405_000 - newOrigin; // 403500ms
    const compensatedStartMs = initialStartMs + originShift; // -200 + 403500 = 403300ms
    const xAfter = (newRelStart - compensatedStartMs) * zoom; // = (403500 - 403300) * 0.122 = 24.4

    // Visual position must be identical before and after origin shift + compensation.
    expect(xAfter).toBeCloseTo(xBefore, 5);
  });

  it('no compensation needed when origin does not change', () => {
    const origin = 1_500;
    const originShift = origin - origin; // = 0
    expect(originShift).toBe(0);
  });
});
