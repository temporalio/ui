import { describe, expect, it } from 'vitest';

import {
  clampScaleY,
  clampViewportStartMs,
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
