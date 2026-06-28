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
 * @returns Track indices for above and below gutters, sorted closest-to-viewport first.
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
  if (trackCount === 0) return { aboveTrackIdxs: [], belowTrackIdxs: [] };

  // O(1) arithmetic: compute the last above and first below track index directly
  // from the scroll position, without iterating all tracks.
  //
  // In normal (desc) order, track t is at screenY = containerY + t * rowSize.
  //   Above:  screenY + effectiveTrackH < topEdge
  //           → t < (topEdge - containerY - effectiveTrackH) / rowSize
  //   Below:  screenY > bottomEdge
  //           → t > (bottomEdge - containerY) / rowSize
  //
  // In reversed (asc) order, track t has localIdx = trackCount - 1 - t, so
  // screenY = containerY + (trackCount - 1 - t) * rowSize; the same thresholds
  // apply to localIdx, which we then convert back to t.
  const aboveThreshold = (topEdge - containerY - effectiveTrackH) / rowSize;
  const belowThreshold = (bottomEdge - containerY) / rowSize;

  const above: number[] = [];
  const below: number[] = [];
  const cap = maxPins === Infinity ? trackCount : maxPins;

  if (!reversed) {
    // last above track (closest to viewport): floor(aboveThreshold)
    // Walk closest-to-viewport first → descending t.
    const lastAboveT = Math.min(trackCount - 1, Math.floor(aboveThreshold));
    for (let t = lastAboveT; t >= 0 && above.length < cap; t--) {
      if (hasEvents(t)) above.push(t);
    }

    // first below track (closest to viewport): floor(belowThreshold) + 1
    const firstBelowT = Math.max(0, Math.floor(belowThreshold) + 1);
    for (let t = firstBelowT; t < trackCount && below.length < cap; t++) {
      if (hasEvents(t)) below.push(t);
    }
  } else {
    // Reversed: track t has localIdx = trackCount - 1 - t.
    //   Above localIdx: localIdx <= floor(aboveThreshold)
    //     → t = trackCount - 1 - localIdx >= trackCount - 1 - floor(aboveThreshold)
    //   Closest above: localIdx = floor(aboveThreshold), t = trackCount - 1 - floor(aboveThreshold)
    //   Walk outward: ascending t (descending localIdx).
    const lastAboveLocalIdx = Math.floor(aboveThreshold);
    const firstAboveT = Math.max(0, trackCount - 1 - lastAboveLocalIdx);
    for (let t = firstAboveT; t < trackCount && above.length < cap; t++) {
      if (hasEvents(t)) above.push(t);
    }

    //   Below localIdx: localIdx >= floor(belowThreshold) + 1
    //     → t = trackCount - 1 - localIdx <= trackCount - 2 - floor(belowThreshold)
    //   Closest below: localIdx = floor(belowThreshold) + 1, t = trackCount - 2 - floor(belowThreshold)
    //   Walk outward: descending t (ascending localIdx).
    const firstBelowLocalIdx = Math.floor(belowThreshold) + 1;
    const lastBelowT = Math.min(
      trackCount - 1,
      trackCount - 1 - firstBelowLocalIdx,
    );
    for (let t = lastBelowT; t >= 0 && below.length < cap; t--) {
      if (hasEvents(t)) below.push(t);
    }
  }

  return { aboveTrackIdxs: above, belowTrackIdxs: below };
}
