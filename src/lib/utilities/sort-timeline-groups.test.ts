import { describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

import {
  getTimelineGroups,
  sortGroupsDuringLoading,
} from './sort-timeline-groups';

// Minimal EventGroup stubs — only the fields the sort cares about.
const group = (id: number, isPending: boolean): EventGroup =>
  ({
    id: String(id),
    isPending,
    initialEvent: { id: String(id) },
  }) as unknown as EventGroup;

// Shorthand aliases
const pending = (id: number) => group(id, true);
const done = (id: number) => group(id, false);

// ---------------------------------------------------------------------------
// sortGroupsDuringLoading
// ---------------------------------------------------------------------------

describe('sortGroupsDuringLoading', () => {
  describe('when descMinId is 0 (no descending page yet)', () => {
    it('returns the original array unchanged (no sort applied)', () => {
      const groups = [pending(3605), done(10000), pending(20000)];
      const result = sortGroupsDuringLoading(groups, true, 0);
      expect(result.map((g) => g.id)).toEqual(['3605', '10000', '20000']);
    });
  });

  describe('ascending section false-pending — the "timer jump" bug', () => {
    // The core regression: a group whose companion hasn't been fetched yet by
    // the ascending cursor gets isPending=true.  Its id is BELOW descMinId,
    // meaning the descending cursor hasn't reached it yet either, so we can't
    // know whether it's genuinely open.  It must stay at its natural position.
    it('does not hoist ascending-section pending groups (id < descMinId) in descending display', () => {
      //                  descMinId = 29874
      // event 3605 is in the ascending section — companion not loaded yet
      const groups = [pending(3605), done(25000), done(30000)];
      const result = sortGroupsDuringLoading(groups, true, 29874);
      // 3605 must stay first (natural event-ID order)
      expect(result.map((g) => g.id)).toEqual(['3605', '25000', '30000']);
    });

    it('does not hoist ascending-section pending groups in ascending display', () => {
      const groups = [pending(3605), done(25000), done(30000)];
      const result = sortGroupsDuringLoading(groups, false, 29874);
      expect(result.map((g) => g.id)).toEqual(['3605', '25000', '30000']);
    });
  });

  describe('descending-section genuinely pending (id >= descMinId)', () => {
    // A group at id >= descMinId is in the portion of the timeline already
    // covered by the descending cursor.  If it's still pending, it's genuinely
    // open (the companion doesn't exist yet, e.g. a running timer).
    it('hoists genuinely pending groups to the END in descending display (= top of screen)', () => {
      //                  descMinId = 29874
      // event 30000 is in the descending section and still pending
      const groups = [done(3605), done(25000), pending(30000)];
      const result = sortGroupsDuringLoading(groups, true, 29874);
      // pending group must move to END → rendered at top of descending view
      expect(result.map((g) => g.id)).toEqual(['3605', '25000', '30000']);
    });

    it('hoists genuinely pending groups to the START in ascending display (= top of screen)', () => {
      const groups = [done(3605), done(25000), pending(30000)];
      const result = sortGroupsDuringLoading(groups, false, 29874);
      // pending group must move to START → rendered at top of ascending view
      expect(result.map((g) => g.id)).toEqual(['30000', '3605', '25000']);
    });
  });

  describe('mixed ascending and descending pending groups', () => {
    it('only hoists descending-section pending; leaves ascending-section pending in place', () => {
      // ascending:  3605 (pending — companion not yet fetched)
      // ascending:  15000 (done)
      // descending: 30000 (genuinely pending running timer)
      // descending: 31500 (done)
      // descMinId = 29874
      const groups = [pending(3605), done(15000), pending(30000), done(31500)];
      const result = sortGroupsDuringLoading(groups, true, 29874);
      // 3605 stays at natural position; 30000 moves to end (top of descending view)
      expect(result.map((g) => g.id)).toEqual([
        '3605',
        '15000',
        '31500',
        '30000',
      ]);
    });

    it('handles multiple genuinely pending groups in descending display', () => {
      const groups = [
        done(3000),
        pending(30000),
        done(30500),
        pending(31000),
        done(31500),
      ];
      const result = sortGroupsDuringLoading(groups, true, 29874);
      // pending 30000 and 31000 both move to end; relative order preserved
      expect(result.map((g) => g.id)).toEqual([
        '3000',
        '30500',
        '31500',
        '30000',
        '31000',
      ]);
    });
  });

  describe('boundary: descMinId exactly equals a group id', () => {
    it('treats group at exactly descMinId as a descending-section group', () => {
      const groups = [done(3605), pending(29874), done(31000)];
      const result = sortGroupsDuringLoading(groups, true, 29874);
      // 29874 >= 29874 → genuinely pending → hoisted to end
      expect(result.map((g) => g.id)).toEqual(['3605', '31000', '29874']);
    });

    it('treats group one below descMinId as ascending-section (not hoisted)', () => {
      const groups = [pending(29873), done(30000), done(31000)];
      const result = sortGroupsDuringLoading(groups, true, 29874);
      // 29873 < 29874 → ascending-section → not hoisted
      expect(result.map((g) => g.id)).toEqual(['29873', '30000', '31000']);
    });
  });

  describe('no-op cases', () => {
    it('returns original order when no groups are pending', () => {
      const groups = [done(1000), done(20000), done(30000)];
      expect(
        sortGroupsDuringLoading(groups, true, 29874).map((g) => g.id),
      ).toEqual(['1000', '20000', '30000']);
    });

    it('handles empty array', () => {
      expect(sortGroupsDuringLoading([], true, 29874)).toEqual([]);
    });

    it('does not mutate the input array', () => {
      const groups = [done(3000), pending(30000), done(31000)];
      const copy = [...groups];
      sortGroupsDuringLoading(groups, true, 29874);
      expect(groups).toEqual(copy);
    });
  });
});

// ---------------------------------------------------------------------------
// getTimelineGroups — the combined function used by the layout
// ---------------------------------------------------------------------------

describe('getTimelineGroups', () => {
  it('uses orderGroupsByPending when fetchComplete is true', () => {
    // After full load, genuinely pending groups must appear at top regardless
    // of their event ID — no descMinId gate applies.
    const groups = [done(3605), done(15000), pending(30000)];
    const result = getTimelineGroups(groups, true, true, 29874);
    // orderGroupsByPending(!reverseSort=false) → pending last → top of descending display
    expect(result.map((g) => g.id)).toEqual(['3605', '15000', '30000']);
  });

  it('uses sortGroupsDuringLoading when fetchComplete is false', () => {
    // During loading, ascending-section pending must NOT be hoisted
    const groups = [pending(3605), done(15000), done(30000)];
    const result = getTimelineGroups(groups, true, false, 29874);
    expect(result.map((g) => g.id)).toEqual(['3605', '15000', '30000']);
  });

  it('returns groups as-is when loading and descMinId is 0', () => {
    const groups = [pending(3605), done(15000), pending(30000)];
    const result = getTimelineGroups(groups, true, false, 0);
    expect(result.map((g) => g.id)).toEqual(['3605', '15000', '30000']);
  });
});
