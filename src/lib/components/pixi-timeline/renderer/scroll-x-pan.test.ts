import { describe, expect, it } from 'vitest';

import {
  calcScrollXPan,
  SCROLL_X_PAD_VW,
  X_PAN_EASE,
  X_PAN_IN_VIEW_THRESHOLD,
} from './scroll-x-pan';

// ── Shared fixture ────────────────────────────────────────────────────────────
// 800 px canvas, zoom = 0.1 px/ms → screenMs = 8000 ms
const SCREEN_W = 800;
const ZOOM = 0.1; // px/ms
const SCREEN_MS = SCREEN_W / ZOOM; // 8000 ms
const PAD_MS = (SCREEN_W * SCROLL_X_PAD_VW) / ZOOM; // 0.33 * 8000 = 2640 ms

// Events live at 5000–6000 ms (1000 ms span).
const EV_MIN = 5000;
const EV_MAX = 6000;

// Helper: build a minimal input, overriding only what the test needs.
function input(
  overrides: Partial<Parameters<typeof calcScrollXPan>[0]>,
): Parameters<typeof calcScrollXPan>[0] {
  return {
    evMinMs: EV_MIN,
    evMaxMs: EV_MAX,
    startMs: 0, // default: viewport starts at 0, events at 5000–6000 fully visible
    screenW: SCREEN_W,
    zoom: ZOOM,
    deltaY: 10, // scroll down
    sortOrder: 'desc',
    ...overrides,
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────
describe('exported constants', () => {
  it('SCROLL_X_PAD_VW is 0.33', () => expect(SCROLL_X_PAD_VW).toBe(0.33));
  it('X_PAN_EASE is between 0 and 1', () => {
    expect(X_PAN_EASE).toBeGreaterThan(0);
    expect(X_PAN_EASE).toBeLessThan(1);
  });
  it('X_PAN_IN_VIEW_THRESHOLD is between 0 and 1', () => {
    expect(X_PAN_IN_VIEW_THRESHOLD).toBeGreaterThan(0);
    expect(X_PAN_IN_VIEW_THRESHOLD).toBeLessThanOrEqual(1);
  });
});

// ── Skip when already in view ─────────────────────────────────────────────────
describe('calcScrollXPan – skip when in view', () => {
  it('returns null when events are fully inside the viewport', () => {
    // Viewport 0–8000 ms, events 5000–6000: fully visible (100 %).
    expect(calcScrollXPan(input({ startMs: 0 }))).toBeNull();
  });

  it('returns null when overlap fraction equals the threshold', () => {
    // Overlap = 800 ms out of 1000 ms span = 80 % = threshold.
    // Viewport right edge = evMin + 800 = 5800.  startMs = 5800 - 8000 = -2200.
    const startMs =
      EV_MIN + (EV_MAX - EV_MIN) * X_PAN_IN_VIEW_THRESHOLD - SCREEN_MS;
    expect(calcScrollXPan(input({ startMs }))).toBeNull();
  });

  it('returns null when events are only partially visible but above threshold (custom)', () => {
    // With a strict threshold of 1.0, the 100 % overlap case must still skip.
    expect(
      calcScrollXPan(input({ startMs: 0, inViewThreshold: 1.0 })),
    ).toBeNull();
  });

  it('does NOT skip when overlap is below threshold', () => {
    // Viewport 10000–18000 ms: no overlap with 5000–6000 ms events.
    expect(calcScrollXPan(input({ startMs: 10_000 }))).not.toBeNull();
  });
});

// ── DESC sort order ───────────────────────────────────────────────────────────
describe('calcScrollXPan – DESC sort (newest at top)', () => {
  // Events are off-screen; startMs = 20 000 (viewport 20000–28000, events 5000–6000).
  const offScreen = { startMs: 20_000 };

  it('scroll UP (deltaY < 0) → places events on the right side', () => {
    // goingTowardNewer = true → newStartMs = evMax + pad - screenMs
    const expected = EV_MAX + PAD_MS - SCREEN_MS;
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: -10, sortOrder: 'desc' }),
    );
    expect(result).toBeCloseTo(expected);
  });

  it('scroll DOWN (deltaY > 0) → places events on the left side', () => {
    // goingTowardNewer = false → newStartMs = evMin - pad
    const expected = EV_MIN - PAD_MS;
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'desc' }),
    );
    expect(result).toBeCloseTo(expected);
  });

  it("scroll UP result: events' right edge lands padVw from viewport right", () => {
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: -10, sortOrder: 'desc' }),
    )!;
    const viewRight = result + SCREEN_MS;
    // evMax should be padMs from the right edge.
    expect(viewRight - EV_MAX).toBeCloseTo(PAD_MS);
  });

  it("scroll DOWN result: events' left edge lands padVw from viewport left", () => {
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'desc' }),
    )!;
    // evMin should be padMs from the left edge (startMs).
    expect(EV_MIN - result).toBeCloseTo(PAD_MS);
  });
});

// ── ASC sort order ────────────────────────────────────────────────────────────
describe('calcScrollXPan – ASC sort (oldest at top)', () => {
  const offScreen = { startMs: 20_000 };

  it('scroll UP (deltaY < 0) → places events on the left side', () => {
    // goingTowardNewer = false (UP in ASC goes toward older/earlier) → left
    const expected = EV_MIN - PAD_MS;
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: -10, sortOrder: 'asc' }),
    );
    expect(result).toBeCloseTo(expected);
  });

  it('scroll DOWN (deltaY > 0) → places events on the right side', () => {
    // goingTowardNewer = true (DOWN in ASC goes toward newer/later) → right
    const expected = EV_MAX + PAD_MS - SCREEN_MS;
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'asc' }),
    );
    expect(result).toBeCloseTo(expected);
  });

  it('ASC DOWN result is same as DESC UP result (both go toward newer events)', () => {
    const ascDown = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'asc' }),
    );
    const descUp = calcScrollXPan(
      input({ ...offScreen, deltaY: -10, sortOrder: 'desc' }),
    );
    expect(ascDown).toBeCloseTo(descUp!);
  });

  it('ASC UP result is same as DESC DOWN result (both go toward older events)', () => {
    const ascUp = calcScrollXPan(
      input({ ...offScreen, deltaY: -10, sortOrder: 'asc' }),
    );
    const descDown = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'desc' }),
    );
    expect(ascUp).toBeCloseTo(descDown!);
  });
});

// ── Custom padding ────────────────────────────────────────────────────────────
describe('calcScrollXPan – custom padVw', () => {
  const offScreen = { startMs: 20_000 };

  it("padVw=0 puts the events' left edge exactly at startMs (scroll down, desc)", () => {
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'desc', padVw: 0 }),
    )!;
    expect(result).toBeCloseTo(EV_MIN);
  });

  it("padVw=0 puts the events' right edge exactly at viewport right (scroll up, desc)", () => {
    const result = calcScrollXPan(
      input({ ...offScreen, deltaY: -10, sortOrder: 'desc', padVw: 0 }),
    )!;
    expect(result + SCREEN_MS).toBeCloseTo(EV_MAX);
  });

  it('larger padVw produces more offset from the edge', () => {
    const r1 = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'desc', padVw: 0.1 }),
    )!;
    const r2 = calcScrollXPan(
      input({ ...offScreen, deltaY: 10, sortOrder: 'desc', padVw: 0.5 }),
    )!;
    // larger pad → smaller startMs (more left → events further from left edge)
    expect(r2).toBeLessThan(r1);
  });
});

// ── inViewThreshold ───────────────────────────────────────────────────────────
describe('calcScrollXPan – inViewThreshold', () => {
  it('threshold=0 means any fraction ≥ 0 skips, so fully visible always skips', () => {
    // visibleFraction (1.0) >= 0 → skip.
    expect(
      calcScrollXPan(input({ startMs: 0, inViewThreshold: 0 })),
    ).toBeNull();
  });

  it('threshold=1.0 skips only when events are 100% visible', () => {
    // 100 % visible → skip.
    expect(
      calcScrollXPan(input({ startMs: 0, inViewThreshold: 1.0 })),
    ).toBeNull();
    // ~99 % visible (10 ms of evMax cut off by viewport right edge) → pan.
    // startMs = EV_MAX - 10 - SCREEN_MS so viewport right = EV_MAX - 10.
    const partialStartMs = EV_MAX - 10 - SCREEN_MS;
    expect(
      calcScrollXPan(input({ startMs: partialStartMs, inViewThreshold: 1.0 })),
    ).not.toBeNull();
  });
});
