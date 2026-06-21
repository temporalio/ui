/**
 * Scroll-snap: after the user finishes a scroll gesture on the timeline canvas,
 * the snap logic makes a small alignment correction so the view always lands
 * with the Nth visible event at a specific Y fraction.
 *
 * Behaviour
 * ─────────
 * • Scroll UP   (deltaY < 0, moving towards track 0 / newest events):
 *     Take the Nth visible track FROM THE TOP of the current viewport and
 *     position it at `topYFrac` (default 25 %) from the top of the event area.
 *     This is a small correction (≤ eventIndex × rowH) that "clicks" the view
 *     to the nearest row boundary near the top-right quadrant.
 *
 * • Scroll DOWN (deltaY > 0, moving towards last track / oldest events):
 *     Take the Nth visible track FROM THE BOTTOM of the current viewport and
 *     position it at `botYFrac` (default 75 %) from the top of the event area.
 *     Small correction that clicks to a row boundary near the bottom-left
 *     quadrant.
 *
 * The snap fires ONCE after scroll wheel events stop (post-scroll debounce).
 * Native DOM scroll runs freely during the gesture; the snap is a subtle
 * landing correction only, never a jump that would move the view out of range.
 *
 * All values are configurable via ScrollSnapConfig.
 */

export interface ScrollSnapConfig {
  /**
   * Which visible event (1-indexed from the approaching edge) to anchor on.
   * 4 means "the 4th visible track from the top (scroll up) or bottom (scroll down)".
   */
  eventIndex: number;
  /**
   * Y fraction (0–1) within the event area at which the anchor event sits
   * when scrolling UP.  0.25 = top quadrant.
   */
  topYFrac: number;
  /**
   * Y fraction (0–1) within the event area at which the anchor event sits
   * when scrolling DOWN.  0.75 = bottom quadrant.
   */
  botYFrac: number;
}

export const DEFAULT_SCROLL_SNAP_CONFIG: ScrollSnapConfig = {
  eventIndex: 4,
  topYFrac: 0.25,
  botYFrac: 0.75,
};

/**
 * Debounce delay for the post-scroll snap in milliseconds.
 *
 * Native DOM scroll runs freely while the user is scrolling.  Once wheel
 * events stop firing for this long we consider the gesture finished and snap
 * the viewport to the nearest "4th event at target quadrant" position.
 *
 * 150 ms is long enough to absorb macOS inertia trailing events but short
 * enough that the final nudge feels like a natural settle, not a lag.
 */
export const SNAP_COOLDOWN_MS = 150;

/**
 * Calculate the new `scrollY` after a post-scroll alignment snap.
 *
 * The anchor is the Nth VISIBLE track from the approaching edge of the
 * current viewport (already on screen).  The snap nudges the viewport so
 * that track lands exactly at the target Y fraction.  The correction is
 * always small (≤ eventIndex × rowH ≈ 128 px with defaults) and never
 * moves the view into empty track space beyond the timeline's extent.
 *
 * @param direction      'up' (wheel up, towards track 0) or 'down'.
 * @param currentScrollY Current viewport.scrollY in pixels (post native scroll).
 * @param visibleH       Height of the event area (canvas height − ruler height).
 * @param rowH           Height of one track row in pixels.
 * @param totalTracks    Total number of tracks (used to clamp anchor on scroll down).
 * @param config         Optional overrides (defaults to DEFAULT_SCROLL_SNAP_CONFIG).
 * @returns              New scrollY value (caller must clamp to [0, maxScrollY]).
 */
export function calcSnapScrollY(
  direction: 'up' | 'down',
  currentScrollY: number,
  visibleH: number,
  rowH: number,
  totalTracks: number,
  config: ScrollSnapConfig = DEFAULT_SCROLL_SNAP_CONFIG,
): number {
  const { eventIndex, topYFrac, botYFrac } = config;

  if (direction === 'up') {
    // Anchor: the Nth visible track FROM THE TOP (already in viewport).
    // e.g. eventIndex=4 → track at index topTrack+3 (0-based).
    const topTrack = Math.floor(currentScrollY / rowH);
    const anchorTrack = Math.max(0, topTrack + eventIndex - 1);
    return anchorTrack * rowH - topYFrac * visibleH;
  } else {
    // Anchor: the Nth visible track FROM THE BOTTOM (already in viewport).
    // e.g. eventIndex=4 → track at index bottomTrack-3 (0-based).
    const bottomTrack = Math.floor((currentScrollY + visibleH) / rowH);
    const anchorTrack = Math.min(
      totalTracks - 1,
      Math.max(0, bottomTrack - (eventIndex - 1)),
    );
    return anchorTrack * rowH - botYFrac * visibleH;
  }
}
