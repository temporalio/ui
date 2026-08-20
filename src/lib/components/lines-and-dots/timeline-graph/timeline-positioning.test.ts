import { describe, expect, it } from 'vitest';

import { getDescStart, getRowY, getTotalForY } from './timeline-positioning';

// Real row height from TimelineConfig: baseRadius * 4 = 24
const H = 24;

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
  };

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
  };

  it('descending events are at the top (newest desc row y = 2*H)', () => {
    expect(getRowY(fLen - 1, cfg)).toBe(2 * H);
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
  };

  it('ascending events appear at the top (y starts at 2*H)', () => {
    expect(getRowY(0, cfg)).toBe(2 * H);
    expect(getRowY(1, cfg)).toBe(3 * H);
    expect(getRowY(2, cfg)).toBe(4 * H);
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
  };

  it('ascending sort: first desc group is shifted down by pendingGroupCount', () => {
    // i=0, offset=100: y = (0 + 2 + 100) * H = 102H
    expect(getRowY(0, cfgDesc)).toBe(102 * H);
  });

  it('descending sort: newest desc group (i = fLen-1) appears at top', () => {
    const cfgDescSort = { ...cfgDesc, reverseSort: true };
    // i=2, offset=100: y = (103 + 1 - 2 - 100) * H = 2H
    expect(getRowY(fLen - 1, cfgDescSort)).toBe(2 * H);
  });
});
