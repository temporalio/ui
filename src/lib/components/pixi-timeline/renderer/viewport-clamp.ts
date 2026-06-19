/**
 * Pure viewport clamping logic — X pan and Y scale constraints.
 *
 * All functions are side-effect-free so they can be unit-tested without Pixi.
 */

export type DataRange = { startMs: number; endMs: number };

/**
 * Clamp a candidate viewport startMs so panning cannot go past the data.
 * Half a screen-width of padding is added on each side so the first and last
 * events can be scrolled to the horizontal center of the screen.
 *
 * @param startMs   Candidate left edge of the viewport in relative ms
 * @param dataRange Earliest and latest ms in the dataset
 * @param zoom      Current zoom in px/ms
 * @param screenW   Canvas width in pixels
 */
export function clampViewportStartMs(
  startMs: number,
  dataRange: DataRange,
  zoom: number,
  screenW: number,
): number {
  const halfSpanMs = screenW / (2 * zoom);
  const min = dataRange.startMs - halfSpanMs;
  const max = dataRange.endMs - halfSpanMs;
  return Math.max(min, Math.min(max, startMs));
}

/**
 * Maximum Y scale factor.
 *
 * Capped at 1.0 (the default row height) so that bars never grow taller than
 * their initial size.  At scaleY = 1 rows are already 2× the icon height,
 * which is the readable sweet spot; larger values just waste vertical space.
 * Y zoom-out (scaleY < 1) is unrestricted so more rows fit on screen.
 */
export const MAX_SCALE_Y = 1.0;

/**
 * Clamp a candidate scaleY to the valid [min, MAX_SCALE_Y] range.
 *
 * @param candidate   New scaleY after applying a zoom factor
 * @param trackHeight Row height at scaleY = 1 (pixels); determines the min
 * @param minRowPx    Smallest acceptable row height in pixels (default 12)
 */
export function clampScaleY(
  candidate: number,
  trackHeight: number,
  minRowPx = 12,
): number {
  const min = minRowPx / trackHeight;
  return Math.max(min, Math.min(MAX_SCALE_Y, candidate));
}
