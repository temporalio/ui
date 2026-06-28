/**
 * Compressed Sparse Row (CSR) index for quick per-track event lookups.
 *
 * Replaces the old `byTrack: PinEvent[][]` approach which stored duplicated JS
 * objects per track.  With CSR we store only Int32Arrays of poolIdxs, and look
 * up event data from `getGroupMeta(poolIdx)` on demand.
 *
 * Memory layout (numTracks = T, numGroups = N):
 *   offsets   : Int32Array[T+1]  — offsets[t] = start of track t inside poolIdxs
 *   poolIdxs  : Int32Array[N]    — poolIdxs[offsets[t]..offsets[t+1]) = groups on track t
 *
 * Zero-copy reads: `getTrackSlice` returns a subarray view (no allocation).
 */

export interface TrackIndex {
  readonly offsets: Int32Array;
  readonly poolIdxs: Int32Array;
  readonly numTracks: number;
}

const EMPTY_INT32 = new Int32Array(0);

/**
 * Build a TrackIndex from an array of (poolIdx, trackIdx) pairs.
 * Groups on the same track preserve the order they appear in `groups`.
 */
export function buildTrackIndex(
  groups: readonly { poolIdx: number; trackIdx: number }[],
  numTracks: number,
): TrackIndex {
  if (numTracks === 0 || groups.length === 0) {
    return {
      offsets: new Int32Array(numTracks + 1),
      poolIdxs: EMPTY_INT32,
      numTracks,
    };
  }

  const perTrack = new Int32Array(numTracks);
  for (const { trackIdx } of groups) {
    if (trackIdx >= 0 && trackIdx < numTracks) perTrack[trackIdx]++;
  }

  const offsets = new Int32Array(numTracks + 1);
  for (let t = 0; t < numTracks; t++) {
    offsets[t + 1] = offsets[t] + perTrack[t];
  }

  const poolIdxs = new Int32Array(groups.length);
  const writePos = new Int32Array(offsets); // copy used as write cursors
  for (const { poolIdx, trackIdx } of groups) {
    if (trackIdx >= 0 && trackIdx < numTracks) {
      poolIdxs[writePos[trackIdx]++] = poolIdx;
    }
  }

  return { offsets, poolIdxs, numTracks };
}

/**
 * Return a zero-copy Int32Array view of the poolIdxs for track `t`.
 * The returned slice shares the same underlying buffer as `index.poolIdxs`.
 */
export function getTrackSlice(index: TrackIndex, t: number): Int32Array {
  if (t < 0 || t >= index.numTracks) return EMPTY_INT32;
  return index.poolIdxs.subarray(index.offsets[t], index.offsets[t + 1]);
}

/** True if track `t` contains at least one event. */
export function trackHasEvents(index: TrackIndex, t: number): boolean {
  if (t < 0 || t >= index.numTracks) return false;
  return index.offsets[t + 1] > index.offsets[t];
}

/**
 * Return the union bounding box [evMinMs, evMaxMs] across all events in tracks
 * fromTrack..toTrack (inclusive).  Returns null if no events exist in range.
 */
export function getTrackEventBounds(
  index: TrackIndex,
  fromTrack: number,
  toTrack: number,
  getMs: (poolIdx: number) => { startMs: number; endMs: number },
): { evMinMs: number; evMaxMs: number } | null {
  let evMinMs = Infinity;
  let evMaxMs = -Infinity;

  const lo = Math.max(0, fromTrack);
  const hi = Math.min(index.numTracks - 1, toTrack);

  for (let t = lo; t <= hi; t++) {
    const slice = getTrackSlice(index, t);
    for (let i = 0; i < slice.length; i++) {
      const { startMs, endMs } = getMs(slice[i]);
      if (startMs < evMinMs) evMinMs = startMs;
      if (endMs > evMaxMs) evMaxMs = endMs;
    }
  }

  return evMinMs === Infinity ? null : { evMinMs, evMaxMs };
}

/** Shape returned by collectBestPerTrack. */
export type GutterEventRef = {
  poolIdx: number;
  startMs: number;
  endMs: number;
  pixiType: string;
  pixiStatus: string;
};

/**
 * For each track in `trackIdxs`, pick the single best event using:
 *   1. Longest duration (endMs - startMs) wins
 *   2. Ties broken by typePriority (lower number = more important)
 *
 * Output is sorted by duration DESC. Pass `Infinity` for `maxSample` to
 * return all candidates (the caller is then responsible for limiting output,
 * e.g. via packGutterPins). Empty tracks are silently skipped.
 */
export function collectBestPerTrack(
  trackIdxs: number[],
  index: TrackIndex,
  getEvent: (poolIdx: number) => {
    startMs: number;
    endMs: number;
    pixiType: string;
    pixiStatus?: string;
  },
  typePriority: Record<string, number>,
  typePriorityDefault: number,
  maxSample: number,
): GutterEventRef[] {
  const candidates: GutterEventRef[] = [];

  for (const t of trackIdxs) {
    const slice = getTrackSlice(index, t);
    if (slice.length === 0) continue;

    let bestPoolIdx = -1;
    let bestDuration = -1;
    let bestPriority = Infinity;

    for (let i = 0; i < slice.length; i++) {
      const pIdx = slice[i];
      const ev = getEvent(pIdx);
      const duration = ev.endMs - ev.startMs;
      const priority = typePriority[ev.pixiType] ?? typePriorityDefault;

      if (
        duration > bestDuration ||
        (duration === bestDuration && priority < bestPriority)
      ) {
        bestPoolIdx = pIdx;
        bestDuration = duration;
        bestPriority = priority;
      }
    }

    if (bestPoolIdx === -1) continue;
    const ev = getEvent(bestPoolIdx);
    candidates.push({ poolIdx: bestPoolIdx, pixiStatus: '', ...ev });
  }

  candidates.sort((a, b) => {
    const dA = a.endMs - a.startMs;
    const dB = b.endMs - b.startMs;
    if (dB !== dA) return dB - dA;
    const pA = typePriority[a.pixiType] ?? typePriorityDefault;
    const pB = typePriority[b.pixiType] ?? typePriorityDefault;
    return pA - pB;
  });

  return candidates.slice(0, maxSample);
}
