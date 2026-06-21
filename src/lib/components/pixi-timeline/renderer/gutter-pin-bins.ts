/**
 * Pure, testable gutter pin binning logic.
 *
 * Rather than one pin per off-screen track (which causes 60 pins to pile up at
 * a single X position), we bin all off-screen events into N horizontal slots
 * across the canvas.  One pin (the longest-duration event) is shown per
 * populated slot.
 *
 * X-position uses endMs (when the event last ran), NOT center.  This ensures:
 *   - Long-running activities above the viewport (started early, ended late)
 *     appear to the RIGHT of where they started — matching where they were
 *     "most recently active" in time.
 *   - Desc mode top gutter: above events (newer, later endMs) → RIGHT side.
 *   - Desc mode bottom gutter: below events (older, earlier endMs) → LEFT side.
 *   - Asc mode invariant flips symmetrically.
 */

export interface GutterBinInput {
  startMs: number;
  endMs: number;
}

export interface BinnedGutterPin<T extends GutterBinInput = GutterBinInput> {
  px: number;
  pw: number;
  binIdx: number;
  event: T;
}

/**
 * Assign each event to a time-based bin across the viewport width.
 * For events outside the viewport, clamp to the left or right edge bin.
 * Returns at most `nBins` pins (one per populated bin).
 *
 * @param events      Off-screen track events to display (one per track, pre-sorted by time)
 * @param viewStartMs Left edge of the current viewport in relative ms
 * @param viewEndMs   Right edge of the current viewport in relative ms
 * @param screenW     Canvas width in logical pixels
 * @param pinMargin   Left/right margin in pixels
 * @param nBins       Number of horizontal bins (determines resolution)
 */
export function binGutterPins<T extends GutterBinInput>(
  events: T[],
  viewStartMs: number,
  viewEndMs: number,
  screenW: number,
  pinMargin: number,
  nBins: number,
): BinnedGutterPin<T>[] {
  if (events.length === 0 || nBins <= 0) return [];

  const usable = screenW - 2 * pinMargin;
  const binW = usable / nBins;
  const viewSpanMs = viewEndMs - viewStartMs;

  const binBest: (T | null)[] = new Array(nBins).fill(null);

  for (const ev of events) {
    // Use endMs so long-running activities (started early, ended late) are
    // placed at their most-recent-activity time, keeping above-viewport events
    // on the RIGHT and below-viewport events on the LEFT.
    const clampedMs = Math.max(viewStartMs, Math.min(viewEndMs, ev.endMs));
    const t = viewSpanMs > 0 ? (clampedMs - viewStartMs) / viewSpanMs : 0;
    const binIdx = Math.max(0, Math.min(nBins - 1, Math.floor(t * nBins)));

    const cur = binBest[binIdx];
    if (!cur || ev.endMs - ev.startMs > cur.endMs - cur.startMs) {
      binBest[binIdx] = ev;
    }
  }

  const result: BinnedGutterPin<T>[] = [];
  for (let i = 0; i < nBins; i++) {
    const ev = binBest[i];
    if (!ev) continue;
    const px = pinMargin + i * binW;
    const pw = Math.max(2, binW - 1);
    result.push({ px, pw, binIdx: i, event: ev });
  }
  return result;
}
