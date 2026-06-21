/**
 * Pure helper for the "pan X on vertical scroll" feature.
 *
 * When the user scrolls vertically the timeline should automatically pan the
 * X axis so the events now in the Y viewport remain visible in the canvas.
 *
 * Direction rules (matches the reading direction of each sort order):
 *   DESC (newest at top)
 *     scroll UP   → going toward newer/later events  → place on RIGHT
 *     scroll DOWN → going toward older/earlier events → place on LEFT
 *   ASC  (oldest at top)
 *     scroll UP   → going toward older/earlier events → place on LEFT
 *     scroll DOWN → going toward newer/later events  → place on RIGHT
 *
 * Constants (exported for tests and for PixiRenderer to import):
 *   SCROLL_X_PAD_VW         – padding as a fraction of canvas width (default 0.33)
 *   X_PAN_EASE              – per-frame ease factor for animated X pan (default 0.15)
 *   X_PAN_IN_VIEW_THRESHOLD – skip pan if this fraction of event span is visible (default 0.8)
 */

export const SCROLL_X_PAD_VW = 0.33;
export const X_PAN_EASE = 0.15;
export const X_PAN_IN_VIEW_THRESHOLD = 0.8;

export interface XPanInput {
  evMinMs: number;
  evMaxMs: number;
  startMs: number;
  screenW: number;
  zoom: number;
  deltaY: number;
  sortOrder: 'desc' | 'asc';
  padVw?: number;
  inViewThreshold?: number;
}

/**
 * Calculate the new `startMs` for the X-pan-on-vertical-scroll feature.
 *
 * Returns `null` if the events are already sufficiently visible and no pan is
 * needed.  Otherwise returns the raw (unclamped) desired viewport start in
 * milliseconds — the caller is responsible for clamping to valid bounds.
 */
export function calcScrollXPan({
  evMinMs,
  evMaxMs,
  startMs,
  screenW,
  zoom,
  deltaY,
  sortOrder,
  padVw = SCROLL_X_PAD_VW,
  inViewThreshold = X_PAN_IN_VIEW_THRESHOLD,
}: XPanInput): number | null {
  const screenMs = screenW / zoom;

  const overlapMs = Math.max(
    0,
    Math.min(evMaxMs, startMs + screenMs) - Math.max(evMinMs, startMs),
  );
  const visibleFraction = overlapMs / Math.max(1, evMaxMs - evMinMs);
  if (visibleFraction >= inViewThreshold) {
    return null;
  }

  const padMs = (screenW * padVw) / zoom;

  // Newer events are later in time (higher ms = right side of timeline).
  // DESC: scrolling UP moves toward newer events.
  // ASC:  scrolling DOWN moves toward newer events.
  const goingTowardNewer =
    (deltaY < 0 && sortOrder === 'desc') || (deltaY > 0 && sortOrder === 'asc');

  return goingTowardNewer
    ? evMaxMs + padMs - screenMs // events' right edge padMs from viewport right
    : evMinMs - padMs; // events' left edge padMs from viewport left
}
