import { describe, expect, it } from 'vitest';

import { getCategoryStrokeColor } from '$lib/components/lines-and-dots/colors';
import type { EventTypeCategory } from '$lib/types/events';

import { buildRunBar, PENDING_OPACITY, runBarSlots } from './run-bar';
import type { RunBarGroup } from '../../types';

const group = (
  category: EventTypeCategory,
  { isPending = false } = {},
): RunBarGroup => ({ category, isPending });

const categories = (segments: ReturnType<typeof buildRunBar>) =>
  segments.map((segment) => segment.category);

describe('runBarSlots', () => {
  it('fits one slot per 2px', () => {
    expect(runBarSlots(148)).toBe(74);
    expect(runBarSlots(149)).toBe(74);
  });

  it('keeps at least one slot', () => {
    expect(runBarSlots(0)).toBe(1);
  });
});

describe('buildRunBar', () => {
  it('draws one segment per group in start order under capacity', () => {
    const segments = buildRunBar(
      [group('activity'), group('timer'), group('signal')],
      20,
    );

    expect(segments).toEqual([
      {
        category: 'activity',
        color: getCategoryStrokeColor('activity'),
        opacity: 1,
      },
      { category: 'timer', color: getCategoryStrokeColor('timer'), opacity: 1 },
      {
        category: 'signal',
        color: getCategoryStrokeColor('signal'),
        opacity: 1,
      },
    ]);
  });

  it('draws pending groups at reduced opacity', () => {
    const [segment] = buildRunBar([group('activity', { isPending: true })], 20);

    expect(segment.opacity).toBe(PENDING_OPACITY);
  });

  it('merges consecutive groups into equal buckets over capacity', () => {
    const groups = [
      group('activity'),
      group('activity'),
      group('timer'),
      group('timer'),
      group('signal'),
      group('signal'),
    ];

    expect(categories(buildRunBar(groups, 6))).toEqual([
      'activity',
      'timer',
      'signal',
    ]);
  });

  it('colours a bucket by its dominant category', () => {
    const groups = [
      group('timer'),
      group('activity'),
      group('activity'),
      group('signal'),
      group('signal'),
      group('signal'),
    ];

    const segments = buildRunBar(groups, 4);

    expect(categories(segments)).toEqual(['activity', 'signal']);
    expect(segments[0].color).toBe(getCategoryStrokeColor('activity'));
  });

  it('breaks a tie towards the first category seen', () => {
    const groups = [group('timer'), group('activity')];

    expect(categories(buildRunBar(groups, 2))).toEqual(['timer']);
  });

  it('draws a bucket at reduced opacity when any group in it is pending', () => {
    const groups = [
      group('activity'),
      group('activity', { isPending: true }),
      group('timer'),
      group('timer'),
    ];

    const segments = buildRunBar(groups, 4);

    expect(segments.map((segment) => segment.opacity)).toEqual([
      PENDING_OPACITY,
      1,
    ]);
  });

  it('never draws more segments than slots', () => {
    const groups = Array.from({ length: 1000 }, () => group('activity'));

    expect(buildRunBar(groups, 148)).toHaveLength(74);
  });
});
