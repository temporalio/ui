import { describe, expect, test } from 'vitest';

import {
  assignTimelineRowPool,
  type TimelineRowSlot,
} from './timeline-row-pool';

type Group = { id: string; version?: number };

const groups: Group[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index),
  version: 1,
}));

const assign = (
  poolSize: number,
  windowStart: number,
  windowEnd: number,
  previousSlots: (TimelineRowSlot<Group> | null)[] = [],
  currentGroups = groups,
) =>
  assignTimelineRowPool({
    groups: currentGroups,
    poolSize,
    previousSlots,
    windowEnd,
    windowStart,
  });

describe('assignTimelineRowPool', () => {
  test('keeps existing groups in the same slots when the pool grows', () => {
    const initial = assign(3, 4, 7);
    const grown = assign(6, 2, 8, initial);

    expect(grown.slice(0, 3)).toEqual(initial);
    expect(grown.slice(3).map((slot) => slot?.lazy.id)).toEqual([
      '2',
      '3',
      '7',
    ]);
  });

  test('only repoints slots whose groups left a sliding window', () => {
    const initial = assign(4, 2, 6);
    const shifted = assign(4, 3, 7, initial);

    expect(shifted[1]).toBe(initial[1]);
    expect(shifted[2]).toBe(initial[2]);
    expect(shifted[3]).toBe(initial[3]);
    expect(shifted[0]?.lazy.id).toBe('6');
  });

  test('updates a group in place when its content version changes', () => {
    const initial = assign(3, 4, 7);
    const updatedGroups = groups.with(5, { ...groups[5], version: 2 });
    const updated = assign(3, 4, 7, initial, updatedGroups);

    expect(updated[0]).toBe(initial[0]);
    expect(updated[1]).not.toBe(initial[1]);
    expect(updated[1]).toMatchObject({
      index: 5,
      lazy: updatedGroups[5],
      version: 2,
    });
    expect(updated[2]).toBe(initial[2]);
  });
});
