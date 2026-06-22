/**
 * Tests for the CSR (Compressed Sparse Row) TrackIndex structure.
 *
 * RED tests run first to prove the old byTrack approach's limitations, then
 * GREEN tests validate the new structure's correctness and zero-copy guarantees.
 */
import { describe, expect, it } from 'vitest';

import {
  buildTrackIndex,
  collectBestPerTrack,
  getTrackEventBounds,
  getTrackSlice,
  trackHasEvents,
} from './track-index';

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeGroups(specs: { poolIdx: number; trackIdx: number }[]) {
  return specs;
}

const THREE_TRACKS = makeGroups([
  { poolIdx: 0, trackIdx: 0 },
  { poolIdx: 1, trackIdx: 2 },
  { poolIdx: 2, trackIdx: 2 },
  { poolIdx: 3, trackIdx: 4 },
]);

// ── buildTrackIndex ───────────────────────────────────────────────────────────

describe('buildTrackIndex – storage is TypedArrays, not JS objects', () => {
  it('offsets is an Int32Array', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(idx.offsets).toBeInstanceOf(Int32Array);
  });

  it('poolIdxs is an Int32Array', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(idx.poolIdxs).toBeInstanceOf(Int32Array);
  });

  it('offsets has length numTracks + 1', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(idx.offsets.length).toBe(6); // 5 tracks + 1
  });

  it('poolIdxs has length equal to the number of groups', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(idx.poolIdxs.length).toBe(THREE_TRACKS.length);
  });

  it('empty group list produces zero-length poolIdxs', () => {
    const idx = buildTrackIndex([], 0);
    expect(idx.poolIdxs.length).toBe(0);
    expect(idx.numTracks).toBe(0);
  });

  it('total memory is far less than equivalent JS objects', () => {
    // 1000 groups → CSR = 2 × 1000 × 4 bytes = 8KB
    // PinEvent objects = 1000 × ~88 bytes = ~88KB
    const groups = Array.from({ length: 1000 }, (_, i) => ({
      poolIdx: i,
      trackIdx: i % 50,
    }));
    const idx = buildTrackIndex(groups, 50);
    const csrBytes = idx.offsets.byteLength + idx.poolIdxs.byteLength;
    expect(csrBytes).toBeLessThan(10_000); // < 10KB for 1000 groups
  });
});

describe('buildTrackIndex – correctness', () => {
  it('numTracks matches the supplied value', () => {
    expect(buildTrackIndex(THREE_TRACKS, 5).numTracks).toBe(5);
  });

  it('offsets[0] is always 0', () => {
    expect(buildTrackIndex(THREE_TRACKS, 5).offsets[0]).toBe(0);
  });

  it('offsets[numTracks] equals total number of groups', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(idx.offsets[5]).toBe(THREE_TRACKS.length);
  });

  it('track with 2 events has a span of 2 in offsets', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const span = idx.offsets[3] - idx.offsets[2]; // track 2 has poolIdxs 1 and 2
    expect(span).toBe(2);
  });

  it('empty track has a span of 0', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const span = idx.offsets[2] - idx.offsets[1]; // track 1 is empty
    expect(span).toBe(0);
  });

  it('contains all supplied poolIdxs across all tracks', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const all = Array.from(idx.poolIdxs).sort((a, b) => a - b);
    expect(all).toEqual([0, 1, 2, 3]);
  });
});

// ── getTrackSlice ─────────────────────────────────────────────────────────────

describe('getTrackSlice – zero-copy views', () => {
  it('returns an Int32Array (no Array)', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(getTrackSlice(idx, 0)).toBeInstanceOf(Int32Array);
  });

  it('returned slice shares the same buffer as poolIdxs (no copy)', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const slice = getTrackSlice(idx, 0);
    expect(slice.buffer).toBe(idx.poolIdxs.buffer);
  });

  it('slice for track 0 contains poolIdx 0', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(Array.from(getTrackSlice(idx, 0))).toContain(0);
  });

  it('slice for track 2 contains poolIdxs 1 and 2', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const slice = Array.from(getTrackSlice(idx, 2)).sort();
    expect(slice).toEqual([1, 2]);
  });

  it('slice for empty track has length 0', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(getTrackSlice(idx, 1).length).toBe(0);
  });

  it('out-of-range track returns empty slice without throwing', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(() => getTrackSlice(idx, 99)).not.toThrow();
    expect(getTrackSlice(idx, 99).length).toBe(0);
  });
});

// ── trackHasEvents ────────────────────────────────────────────────────────────

describe('trackHasEvents', () => {
  it('returns true for a track with events', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(trackHasEvents(idx, 0)).toBe(true);
    expect(trackHasEvents(idx, 2)).toBe(true);
    expect(trackHasEvents(idx, 4)).toBe(true);
  });

  it('returns false for an empty track', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(trackHasEvents(idx, 1)).toBe(false);
    expect(trackHasEvents(idx, 3)).toBe(false);
  });

  it('returns false for an out-of-range track', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    expect(trackHasEvents(idx, 99)).toBe(false);
  });
});

// ── getTrackEventBounds ───────────────────────────────────────────────────────

describe('getTrackEventBounds – X range for visible tracks', () => {
  const META: Record<number, { startMs: number; endMs: number }> = {
    0: { startMs: 1000, endMs: 2000 },
    1: { startMs: 500, endMs: 1500 },
    2: { startMs: 3000, endMs: 4000 },
    3: { startMs: 100, endMs: 200 },
  };
  const getMs = (poolIdx: number) => META[poolIdx];

  it('returns null when no tracks in range have events', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    // tracks 1 and 3 are empty
    expect(getTrackEventBounds(idx, 1, 1, getMs)).toBeNull();
  });

  it('returns correct min/max for a single track', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const bounds = getTrackEventBounds(idx, 0, 0, getMs);
    expect(bounds).toEqual({ evMinMs: 1000, evMaxMs: 2000 });
  });

  it('returns the union of all events across a range of tracks', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    // Tracks 0-4: track 0 (1000-2000), track 2 (500-4000), track 4 (100-200)
    const bounds = getTrackEventBounds(idx, 0, 4, getMs);
    expect(bounds?.evMinMs).toBe(100);
    expect(bounds?.evMaxMs).toBe(4000);
  });

  it('handles a range that spans empty tracks', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    // tracks 0-1: only track 0 has events
    const bounds = getTrackEventBounds(idx, 0, 1, getMs);
    expect(bounds).toEqual({ evMinMs: 1000, evMaxMs: 2000 });
  });
});

// ── collectBestPerTrack ───────────────────────────────────────────────────────

describe('collectBestPerTrack – gutter best-event selection via CSR', () => {
  const EVENTS: Record<
    number,
    { startMs: number; endMs: number; pixiType: string }
  > = {
    0: { startMs: 0, endMs: 5000, pixiType: 'GROUP_ACTIVITY' },
    1: { startMs: 100, endMs: 200, pixiType: 'GROUP_ACTIVITY' },
    2: { startMs: 200, endMs: 9000, pixiType: 'GROUP_TIMER' },
    3: { startMs: 0, endMs: 1000, pixiType: 'GROUP_ACTIVITY' },
  };
  const TYPE_PRIORITY = { GROUP_TIMER: 1, GROUP_ACTIVITY: 5 };
  const DEFAULT_PRIORITY = 99;
  const getEvent = (poolIdx: number) => EVENTS[poolIdx];

  it('returns an array of objects with poolIdx, startMs, endMs, pixiType', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const out = collectBestPerTrack(
      [0, 2, 4],
      idx,
      getEvent,
      TYPE_PRIORITY,
      DEFAULT_PRIORITY,
      10,
    );
    expect(out.length).toBeGreaterThan(0);
    for (const item of out) {
      expect(item).toHaveProperty('poolIdx');
      expect(item).toHaveProperty('startMs');
      expect(item).toHaveProperty('endMs');
      expect(item).toHaveProperty('pixiType');
    }
  });

  it('selects the longest-duration event per track', () => {
    // Track 2 has poolIdxs 1 (100ms) and 2 (8800ms) — should pick poolIdx 2
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const out = collectBestPerTrack(
      [2],
      idx,
      getEvent,
      TYPE_PRIORITY,
      DEFAULT_PRIORITY,
      10,
    );
    expect(out[0].poolIdx).toBe(2);
  });

  it('skips empty tracks silently', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    // track 1 is empty
    const out = collectBestPerTrack(
      [1],
      idx,
      getEvent,
      TYPE_PRIORITY,
      DEFAULT_PRIORITY,
      10,
    );
    expect(out.length).toBe(0);
  });

  it('sorts output by duration DESC', () => {
    // track 0 (poolIdx 0: 5000ms), track 2 (poolIdx 2: 8800ms), track 4 (poolIdx 3: 1000ms)
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const out = collectBestPerTrack(
      [0, 2, 4],
      idx,
      getEvent,
      TYPE_PRIORITY,
      DEFAULT_PRIORITY,
      10,
    );
    const durations = out.map((e) => e.endMs - e.startMs);
    for (let i = 1; i < durations.length; i++) {
      expect(durations[i]).toBeLessThanOrEqual(durations[i - 1]);
    }
  });

  it('caps output at maxSample', () => {
    const idx = buildTrackIndex(THREE_TRACKS, 5);
    const out = collectBestPerTrack(
      [0, 2, 4],
      idx,
      getEvent,
      TYPE_PRIORITY,
      DEFAULT_PRIORITY,
      2,
    );
    expect(out.length).toBeLessThanOrEqual(2);
  });

  it('breaks duration ties by type priority (lower number wins)', () => {
    // Both poolIdx 0 and 1 have duration 5000ms, but types differ
    const tieGroups = makeGroups([
      { poolIdx: 0, trackIdx: 0 },
      { poolIdx: 1, trackIdx: 1 },
    ]);
    const tieEvents: Record<
      number,
      { startMs: number; endMs: number; pixiType: string }
    > = {
      0: { startMs: 0, endMs: 5000, pixiType: 'GROUP_ACTIVITY' }, // priority 5
      1: { startMs: 0, endMs: 5000, pixiType: 'GROUP_TIMER' }, // priority 1
    };
    const idx = buildTrackIndex(tieGroups, 2);
    const out = collectBestPerTrack(
      [0, 1],
      idx,
      (p) => tieEvents[p],
      TYPE_PRIORITY,
      DEFAULT_PRIORITY,
      10,
    );
    expect(out[0].pixiType).toBe('GROUP_TIMER'); // timer wins (lower priority number)
  });
});
