import { describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

import { orderGroupsByPending } from './order-groups-by-pending';

const pendingGroup = (id: string) =>
  ({ id, isPending: true }) as unknown as EventGroup;
const completedGroup = (id: string) =>
  ({ id, isPending: false }) as unknown as EventGroup;

describe('orderGroupsByPending', () => {
  it('should put pending groups first when descending', () => {
    const groups = [
      completedGroup('1'),
      pendingGroup('2'),
      completedGroup('3'),
    ];
    const result = orderGroupsByPending(groups, true);
    expect(result.map((g) => g.id)).toEqual(['2', '1', '3']);
  });

  it('should put pending groups last when ascending', () => {
    const groups = [
      completedGroup('1'),
      pendingGroup('2'),
      completedGroup('3'),
    ];
    const result = orderGroupsByPending(groups, false);
    expect(result.map((g) => g.id)).toEqual(['1', '3', '2']);
  });

  it('should preserve relative order within pending and non-pending subsets', () => {
    const groups = [
      pendingGroup('10'),
      completedGroup('3'),
      pendingGroup('5'),
      completedGroup('7'),
    ];
    const result = orderGroupsByPending(groups, true);
    expect(result.map((g) => g.id)).toEqual(['10', '5', '3', '7']);
  });

  it('should return groups in original order when no groups are pending', () => {
    const groups = [
      completedGroup('1'),
      completedGroup('2'),
      completedGroup('3'),
    ];
    const descResult = orderGroupsByPending(groups, true);
    const ascResult = orderGroupsByPending(groups, false);
    expect(descResult.map((g) => g.id)).toEqual(['1', '2', '3']);
    expect(ascResult.map((g) => g.id)).toEqual(['1', '2', '3']);
  });

  it('should return groups in original order when all groups are pending', () => {
    const groups = [pendingGroup('1'), pendingGroup('2'), pendingGroup('3')];
    const descResult = orderGroupsByPending(groups, true);
    const ascResult = orderGroupsByPending(groups, false);
    expect(descResult.map((g) => g.id)).toEqual(['1', '2', '3']);
    expect(ascResult.map((g) => g.id)).toEqual(['1', '2', '3']);
  });

  it('should return empty array for empty input', () => {
    expect(orderGroupsByPending([], true)).toEqual([]);
    expect(orderGroupsByPending([], false)).toEqual([]);
  });

  it('should not mutate the input array', () => {
    const groups = [
      completedGroup('1'),
      pendingGroup('2'),
      completedGroup('3'),
    ];
    const original = [...groups];
    orderGroupsByPending(groups, true);
    expect(groups).toEqual(original);
  });
});
