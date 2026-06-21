/**
 * Pure, testable helper for selecting the best representative event per track
 * to display in the top/bottom gutter strips.
 *
 * Selection order (primary → secondary → tertiary):
 *  1. Duration DESC   — longer events are more visually important
 *  2. Type priority ASC — failures/signals/child-workflows before plain activities
 *  3. Input order     — when all else is equal the iteration order is preserved,
 *                       so the caller can pass tracks in proximity order (closest
 *                       first) to ensure the PACK_SAMPLE cap retains the most
 *                       contextually relevant events.
 */

export type GutterEvent = {
  startMs: number;
  endMs: number;
  pixiType: string;
};

/**
 * Collect the best (longest-duration) event per track, then rank by
 * (duration DESC, type priority ASC) and cap at `maxSample`.
 *
 * @param trackIdxs   Track indices to process, in desired priority order
 *                    (caller should reverse above-gutter indices so that
 *                    closest-to-viewport tracks come first).
 * @param byTrack     Indexed event list per track (sparse — may be undefined).
 * @param typePriority  Map from pixiType to numeric priority (lower = more important).
 * @param typePriorityDefault  Fallback priority for unmapped types.
 * @param maxSample   Maximum number of events to return.
 */
export function collectGutterBest<T extends GutterEvent>(
  trackIdxs: number[],
  byTrack: (T[] | undefined)[],
  typePriority: Record<string, number>,
  typePriorityDefault: number,
  maxSample: number,
): T[] {
  const out: T[] = [];
  for (const t of trackIdxs) {
    const evs = byTrack[t];
    if (!evs?.length) continue;
    let best = evs[0];
    for (let i = 1; i < evs.length; i++) {
      const e = evs[i];
      if (e.endMs - e.startMs > best.endMs - best.startMs) best = e;
    }
    out.push(best);
  }

  out.sort((a, b) => {
    const durDiff = b.endMs - b.startMs - (a.endMs - a.startMs);
    if (durDiff !== 0) return durDiff;
    const pa = typePriority[a.pixiType] ?? typePriorityDefault;
    const pb = typePriority[b.pixiType] ?? typePriorityDefault;
    return pa - pb;
  });

  return out.length > maxSample ? out.slice(0, maxSample) : out;
}
