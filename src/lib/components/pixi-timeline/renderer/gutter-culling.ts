/**
 * Pure, side-effect-free functions for determining which track rows belong in
 * the top / bottom gutter.  Extracted here so they can be unit-tested without
 * any Pixi.js dependency.
 */

/**
 * Determine which track indices should appear as top and bottom gutter pins.
 *
 * Rules:
 *  - A track is "above" when its entire row is above the visible area
 *    (`screenY + effectiveTrackH < topEdge`).
 *  - A track is "below" when its top edge is below the visible area
 *    (`screenY > bottomEdge`).
 *  - Empty tracks (loading gap, not-yet-fetched data) are excluded via the
 *    optional `hasEvents` predicate so the gutter jumps over the loading gap
 *    to the nearest populated off-screen tracks.
 *  - We keep only the `maxPins` tracks closest to the viewport edge:
 *      • above: highest screenY values (tracks just scrolled off the top)
 *      • below: lowest screenY values (tracks just about to appear at bottom)
 *  - This prevents the gutter from flooding with thousands of pins when most
 *    tracks are off-screen.
 *
 * @param trackCount   Total number of tracks
 * @param containerY   Y offset of the scroll container (RULER_H - scrollY)
 * @param rowSize      Height of one row including gap (trackH + gap)
 * @param effectiveTrackH Visible height of the event bar inside a row
 * @param topEdge      Y coordinate of the ruler bottom (start of track area)
 * @param bottomEdge   Y coordinate of the canvas bottom (end of track area)
 * @param maxPins      Maximum pins per gutter (cap)
 * @param hasEvents    Optional predicate — return false to skip empty tracks
 * @returns Track indices for above and below gutters, sorted by proximity to viewport
 */
/**
 * @param reversed  When true (asc sort order), track indices are rendered in
 *                  reverse Y order: track 0 renders at the bottom, track
 *                  (trackCount-1) at the top.  The screenY calculation is
 *                  adjusted accordingly.
 */
export function gatherGutterTracks(
  trackCount: number,
  containerY: number,
  rowSize: number,
  effectiveTrackH: number,
  topEdge: number,
  bottomEdge: number,
  maxPins: number,
  hasEvents: (t: number) => boolean = () => true,
  reversed = false,
): { aboveTrackIdxs: number[]; belowTrackIdxs: number[] } {
  const above: number[] = [];
  const below: number[] = [];

  for (let t = 0; t < trackCount; t++) {
    if (!hasEvents(t)) continue;
    const localIdx = reversed ? trackCount - 1 - t : t;
    const screenY = containerY + localIdx * rowSize;
    if (screenY + effectiveTrackH < topEdge) {
      above.push(t);
    } else if (screenY > bottomEdge) {
      below.push(t);
    }
  }

  // In normal order: `above` list is ascending t → ascending screenY.
  // Closest to the viewport top = largest t (end of array).
  // `below` list is ascending t → ascending screenY.
  // Closest to the viewport bottom = smallest t (start of array).
  // In reversed order the same logic applies because we push `t` (original
  // index), and the screenY calculation already accounts for the reversal.
  return {
    aboveTrackIdxs: maxPins === Infinity ? above : above.slice(-maxPins),
    belowTrackIdxs: maxPins === Infinity ? below : below.slice(0, maxPins),
  };
}
