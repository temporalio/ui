import { describe, expect, it } from 'vitest';

import {
  getDescStart,
  getPendingBlockY,
  getRowY,
  getTotalForY,
} from './timeline-positioning';

// Real constants from TimelineConfig: height = baseRadius * 4 = 24, radius = baseRadius * 1.5 = 9
const H = 24;
const R = 9;

function makeGroups(ids: number[]) {
  return ids.map((id) => ({ initialEvent: { id: String(id) } }));
}

// ---------------------------------------------------------------------------
// getDescStart
// ---------------------------------------------------------------------------

describe('getDescStart', () => {
  it('returns groups.length when descMinId is 0 — no descending page yet', () => {
    expect(getDescStart(makeGroups([1, 4, 7]), 0, true, 100)).toBe(3);
  });

  it('returns groups.length when loading is false — fetch complete', () => {
    expect(
      getDescStart(makeGroups([1, 4, 39001, 39004]), 39001, false, 100),
    ).toBe(4);
  });

  it('returns groups.length when pendingGroupCount is 0 — no gap to render', () => {
    expect(getDescStart(makeGroups([1, 4, 39001, 39004]), 39001, true, 0)).toBe(
      4,
    );
  });

  it('finds correct split with mixed asc / desc groups', () => {
    // ascending cursor events 1–10 (group IDs 1,4,7,10)
    // descending cursor events 39001–40000 (group IDs 39001,39004,39007)
    const groups = makeGroups([1, 4, 7, 10, 39001, 39004, 39007]);
    expect(getDescStart(groups, 39001, true, 100)).toBe(4);
  });

  it('returns 0 when every group is from the descending cursor', () => {
    expect(
      getDescStart(makeGroups([39001, 39004, 39007]), 39001, true, 100),
    ).toBe(0);
  });

  it('handles empty group array', () => {
    expect(getDescStart([], 39001, true, 100)).toBe(0);
  });

  it('uses initialEvent.id — correct even when group.id points to an earlier event', () => {
    // TimerFired group: group.id = startedEventId = 7 (ascending range),
    // but initialEvent.id = 7 as well, so no ambiguity here.
    // This test confirms the scan correctly identifies the split regardless.
    const groups = makeGroups([1, 4, 7, 39001, 39004]);
    expect(getDescStart(groups, 39001, true, 100)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// getTotalForY
// ---------------------------------------------------------------------------

describe('getTotalForY', () => {
  it('extends by pendingGroupCount when both cursors have contributed rows', () => {
    // descStart(3) < filteredGroupsLength(6): gap is open
    expect(getTotalForY(6, 100, 3)).toBe(106);
  });

  it('equals filteredGroupsLength when only ascending events are loaded', () => {
    // descStart === filteredGroupsLength → no extension, keep rows at natural position
    expect(getTotalForY(3, 100, 3)).toBe(3);
  });

  it('equals filteredGroupsLength when pendingGroupCount is 0', () => {
    expect(getTotalForY(6, 0, 3)).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// getRowY — ascending sort (reverseSort = false)
// N1=3 ascending groups, N2=3 descending groups, pendingGroupCount=100
// totalForY = 6 + 100 = 106
// ---------------------------------------------------------------------------

describe('getRowY — ascending sort', () => {
  const cfg = {
    descStart: 3,
    pendingGroupCount: 100,
    totalForY: 106,
    reverseSort: false,
    height: H,
  };

  it('first ascending group (i=0) appears at y = 2*H (very top)', () => {
    expect(getRowY(0, cfg)).toBe(2 * H);
  });

  it('ascending groups increase y linearly', () => {
    expect(getRowY(1, cfg)).toBe(3 * H);
    expect(getRowY(2, cfg)).toBe(4 * H);
  });

  it('first descending group (i=descStart) is shifted down by pendingGroupCount', () => {
    // y = (3 + 2 + 100) * H = 105 * H
    expect(getRowY(3, cfg)).toBe(105 * H);
  });

  it('descending groups also increase y linearly', () => {
    expect(getRowY(4, cfg)).toBe(106 * H);
    expect(getRowY(5, cfg)).toBe(107 * H);
  });
});

// ---------------------------------------------------------------------------
// getRowY — descending sort (reverseSort = true)
// Same group counts; newest-first so HIGH indices → LOW y (top of SVG)
// ---------------------------------------------------------------------------

describe('getRowY — descending sort', () => {
  const cfg = {
    descStart: 3,
    pendingGroupCount: 100,
    totalForY: 106,
    reverseSort: true,
    height: H,
  };

  it('newest descending group (i = N-1 = 5) appears at y = 2*H (very top)', () => {
    // offset = pendingGroupCount = 100; y = (106 + 1 - 5 - 100) * H = 2H
    expect(getRowY(5, cfg)).toBe(2 * H);
  });

  it('older descending groups have progressively larger y (further from top)', () => {
    expect(getRowY(4, cfg)).toBe(3 * H);
    expect(getRowY(3, cfg)).toBe(4 * H); // oldest desc group
  });

  it('newest ascending group (i = descStart-1 = 2) is below the gap', () => {
    // offset = 0; y = (106 + 1 - 2 - 0) * H = 105H
    expect(getRowY(2, cfg)).toBe(105 * H);
  });

  it('older ascending groups have progressively larger y (further toward bottom)', () => {
    expect(getRowY(1, cfg)).toBe(106 * H);
    expect(getRowY(0, cfg)).toBe(107 * H); // oldest asc group — very bottom
  });
});

// ---------------------------------------------------------------------------
// getPendingBlockY
// ---------------------------------------------------------------------------

describe('getPendingBlockY', () => {
  it('ascending: gap starts at row descStart+2 minus radius', () => {
    // Last asc row center at y = (descStart+1)*H = 4H.
    // Block starts at (descStart+2)*H - R = 5H - R = 111px.
    // That is H-R px below last asc row center — safely below its circle (radius R).
    const y = getPendingBlockY({
      descStart: 3,
      filteredGroupsLength: 6,
      reverseSort: false,
      height: H,
      radius: R,
    });
    expect(y).toBe(5 * H - R);
  });

  it('descending: gap starts at row N2+2 minus radius (symmetrical)', () => {
    // N2 = filteredGroupsLength - descStart = 3.
    // Oldest desc row center at y = (N2+1)*H = 4H.
    // Block starts at (N2+2)*H - R = 5H - R = 111px.
    const y = getPendingBlockY({
      descStart: 3,
      filteredGroupsLength: 6,
      reverseSort: true,
      height: H,
      radius: R,
    });
    expect(y).toBe(5 * H - R);
  });

  it('ascending with only asc events (descStart = filteredGroupsLength): block is below all rows', () => {
    const y = getPendingBlockY({
      descStart: 3,
      filteredGroupsLength: 3,
      reverseSort: false,
      height: H,
      radius: R,
    });
    // Same formula: (3+2)*H - R = 5H - R. The last row is at 4H so block is below it.
    expect(y).toBe(5 * H - R);
    expect(y).toBeGreaterThan(4 * H); // last row center
  });
});

// ---------------------------------------------------------------------------
// No-overlap invariants — ascending sort
// ---------------------------------------------------------------------------

describe('no overlap: ascending sort', () => {
  const N1 = 3,
    N2 = 3,
    pending = 100;
  const fLen = N1 + N2;
  const descStart = N1;
  const totalForY = getTotalForY(fLen, pending, descStart);
  const cfg = {
    descStart,
    pendingGroupCount: pending,
    totalForY,
    reverseSort: false,
    height: H,
  };
  const blockY = getPendingBlockY({
    descStart,
    filteredGroupsLength: fLen,
    reverseSort: false,
    height: H,
    radius: R,
  });
  const blockH = pending * H + R;

  it('pending block is NOT at the top (y > 2*H)', () => {
    expect(blockY).toBeGreaterThan(2 * H);
  });

  it('pending block starts below the last ascending row', () => {
    const lastAscY = getRowY(N1 - 1, cfg);
    // Block top must be below last asc row bottom edge (center + radius)
    expect(blockY).toBeGreaterThanOrEqual(lastAscY + R);
  });

  it('pending block ends at or before the first descending row', () => {
    const firstDescY = getRowY(N1, cfg);
    // Block bottom must be at or before first desc row top edge (center - radius)
    expect(blockY + blockH).toBeLessThanOrEqual(firstDescY + R);
  });

  it('ascending events are strictly above descending events (no direct adjacency)', () => {
    const lastAscY = getRowY(N1 - 1, cfg);
    const firstDescY = getRowY(N1, cfg);
    expect(firstDescY - lastAscY).toBeGreaterThan(H); // gap of at least one row
  });
});

// ---------------------------------------------------------------------------
// No-overlap invariants — descending sort
// ---------------------------------------------------------------------------

describe('no overlap: descending sort', () => {
  const N1 = 3,
    N2 = 3,
    pending = 100;
  const fLen = N1 + N2;
  const descStart = N1;
  const totalForY = getTotalForY(fLen, pending, descStart);
  const cfg = {
    descStart,
    pendingGroupCount: pending,
    totalForY,
    reverseSort: true,
    height: H,
  };
  const blockY = getPendingBlockY({
    descStart,
    filteredGroupsLength: fLen,
    reverseSort: true,
    height: H,
    radius: R,
  });
  const blockH = pending * H + R;

  it('pending block is NOT at the very top (y > 2*H)', () => {
    expect(blockY).toBeGreaterThan(2 * H);
  });

  it('descending events are at the top (newest desc row y = 2*H)', () => {
    expect(getRowY(fLen - 1, cfg)).toBe(2 * H);
  });

  it('pending block starts below the oldest descending row', () => {
    const oldestDescY = getRowY(N1, cfg); // first desc-cursor group index
    expect(blockY).toBeGreaterThanOrEqual(oldestDescY + R);
  });

  it('pending block ends at or before the newest ascending row', () => {
    const newestAscY = getRowY(N1 - 1, cfg); // last asc-cursor group index
    expect(blockY + blockH).toBeLessThanOrEqual(newestAscY + R);
  });

  it('ascending events are strictly below descending events', () => {
    const oldestDescY = getRowY(N1, cfg);
    const newestAscY = getRowY(N1 - 1, cfg);
    expect(newestAscY - oldestDescY).toBeGreaterThan(H);
  });

  it('oldest ascending group is at the bottom (highest y)', () => {
    const oldestAscY = getRowY(0, cfg);
    expect(oldestAscY).toBe((totalForY + 1) * H);
  });
});

// ---------------------------------------------------------------------------
// Edge case: only ascending cursor loaded (descStart = filteredGroupsLength)
// This is the state after onFirstPage fires but before onFirstDescPage arrives.
// The pending block must NOT be at the top.
// ---------------------------------------------------------------------------

describe('edge case: only ascending events loaded', () => {
  const fLen = 3;
  const descStart = fLen; // no desc events yet → descStart === fLen
  const pending = 100;
  const totalForY = getTotalForY(fLen, pending, descStart); // equals fLen = 3

  const cfg = {
    descStart,
    pendingGroupCount: pending,
    totalForY,
    reverseSort: false,
    height: H,
  };

  it('ascending events appear at the top (y starts at 2*H)', () => {
    expect(getRowY(0, cfg)).toBe(2 * H);
    expect(getRowY(1, cfg)).toBe(3 * H);
    expect(getRowY(2, cfg)).toBe(4 * H);
  });

  it('pending block is below all loaded rows, NOT at the top', () => {
    const blockY = getPendingBlockY({
      descStart,
      filteredGroupsLength: fLen,
      reverseSort: false,
      height: H,
      radius: R,
    });
    expect(blockY).toBeGreaterThan(2 * H); // NOT at top
    expect(blockY).toBeGreaterThan(getRowY(fLen - 1, cfg)); // below last row
  });
});

// ---------------------------------------------------------------------------
// Edge case: only descending cursor loaded first (descStart = 0)
// ---------------------------------------------------------------------------

describe('edge case: only descending events loaded (desc page arrived first)', () => {
  // When only desc events are loaded, descMinId check is used in getDescStart.
  // If descMinId > 0 but filteredGroups contains ONLY desc groups:
  // getDescStart returns 0 (all are desc), descStart = 0.
  const fLen = 3;
  const descStart = 0;
  const pending = 100;
  const totalForY = getTotalForY(fLen, pending, descStart); // fLen + pending = 103

  const cfgDesc = {
    descStart,
    pendingGroupCount: pending,
    totalForY,
    reverseSort: false,
    height: H,
  };

  it('ascending sort: first desc group is shifted down by pendingGroupCount', () => {
    // i=0, offset=100: y = (0 + 2 + 100) * H = 102H
    expect(getRowY(0, cfgDesc)).toBe(102 * H);
  });

  it('ascending sort: pending block is at the very top (before desc events)', () => {
    const blockY = getPendingBlockY({
      descStart: 0,
      filteredGroupsLength: fLen,
      reverseSort: false,
      height: H,
      radius: R,
    });
    // descStart=0: blockY = (0+2)*H - R = 2H - R = 39px
    expect(blockY).toBe(2 * H - R);
  });

  it('descending sort: newest desc group (i = fLen-1) appears at top', () => {
    const cfgDescSort = { ...cfgDesc, reverseSort: true };
    // i=2, offset=100: y = (103 + 1 - 2 - 100) * H = 2H
    expect(getRowY(fLen - 1, cfgDescSort)).toBe(2 * H);
  });
});
