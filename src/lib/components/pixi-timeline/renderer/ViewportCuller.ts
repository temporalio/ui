import { getGroupMeta } from '$lib/services/grouped-event-buffer';

/**
 * Compact entry stored in the spatial index.
 * Uses pool index instead of a full TemporalEvent reference to avoid
 * duplicating event data already stored in the grouped-event-buffer pool.
 */
export interface CullerEntry {
  startMs: number;
  endMs: number;
  trackIndex: number;
  poolIdx: number;
}

/**
 * Two-structure spatial index for visible-range queries.
 *
 * byTrack  — CullerEntry[][] indexed by trackIndex.
 *            Main visible query: O(k) — iterate tracks minTrack..maxTrack.
 * byTime   — flat CullerEntry[] sorted by startMs.
 *            Time-range queries: O(log n + k) via binary search.
 */
export class ViewportCuller {
  private byTrack: CullerEntry[][] = [];
  private byTime: CullerEntry[] = [];

  /**
   * Build the spatial index from the buffer pool.
   * Called after loadEvents() on poolCount groups.
   */
  load(poolCount: number) {
    this.byTrack = [];
    const all: CullerEntry[] = [];

    for (let i = 0; i < poolCount; i++) {
      const meta = getGroupMeta(i);
      if (!meta || !meta.group) continue;
      const entry: CullerEntry = {
        startMs: meta.startMs,
        endMs: meta.endMs,
        trackIndex: meta.trackIndex,
        poolIdx: i,
      };
      (this.byTrack[meta.trackIndex] ??= []).push(entry);
      all.push(entry);
    }

    for (const track of this.byTrack) {
      if (track) track.sort((a, b) => a.startMs - b.startMs);
    }
    this.byTime = all.sort((a, b) => a.startMs - b.startMs);
  }

  /**
   * Main visible-events query: returns every entry whose trackIndex is in
   * [minTrack, maxTrack). When startMs/endMs are -Infinity/Infinity, skips
   * the time filter entirely for max speed.
   */
  query(
    startMs: number,
    endMs: number,
    minTrack = -Infinity,
    maxTrack = Infinity,
  ): CullerEntry[] {
    const timeFiltered = startMs !== -Infinity || endMs !== Infinity;

    if (!timeFiltered) {
      const result: CullerEntry[] = [];
      const lo = Math.max(0, Math.ceil(minTrack));
      const hi = Math.min(this.byTrack.length - 1, Math.floor(maxTrack));
      for (let t = lo; t <= hi; t++) {
        const track = this.byTrack[t];
        if (track) {
          for (const e of track) result.push(e);
        }
      }
      return result;
    }

    let lo = 0;
    let hi = this.byTime.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.byTime[mid].endMs < startMs) lo = mid + 1;
      else hi = mid;
    }
    const result: CullerEntry[] = [];
    for (let i = lo; i < this.byTime.length; i++) {
      const e = this.byTime[i];
      if (e.startMs > endMs) break;
      if (e.trackIndex >= minTrack && e.trackIndex < maxTrack) result.push(e);
    }
    return result;
  }

  clear() {
    this.byTrack = [];
    this.byTime = [];
  }
}
