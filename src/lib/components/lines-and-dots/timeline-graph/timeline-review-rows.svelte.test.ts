import { describe, expect, it } from 'vitest';

import type { LazyGroup } from '$lib/services/grouped-event-buffer';
import type { WorkflowEvents } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

import { ROW_HEIGHT } from './constants';
import { getRowY, getTotalForY } from './timeline-positioning';
import {
  buildTimelineReviewRows,
  getTimelineHeight,
  isTimelineHiddenRun,
  type TimelineReviewGroup,
  type TimelineRow,
} from './timeline-review-rows';

import { Timeline } from './timeline.svelte';

const T0 = Date.UTC(2022, 0, 1, 0, 0, 0);
const iso = (offsetMs: number): string => new Date(T0 + offsetMs).toISOString();

type Group = TimelineReviewGroup;

const group = (
  id: number,
  startMs: number,
  endMs: number,
  isPending = false,
): Group => ({
  id: String(id),
  initialEvent: { id: String(id), eventTime: iso(startMs) },
  lastEvent: { eventTime: iso(endMs) },
  isPending,
});

// Two busy periods with a long idle gap between them.
const groups: Group[] = [
  group(1, 0, 100),
  group(5, 1_000, 1_200),
  group(8, 1_300, 1_500),
  group(11, 1_600, 1_900),
  group(20, 900_000, 900_200),
  group(23, 900_300, 900_500),
  group(26, 900_600, 900_900),
];

const LOW = { score: 0.1 };
const HIGH = { score: 0.9 };
const scores = {
  '1': { score: 1, pinned: true },
  '5': LOW,
  '8': LOW,
  '11': LOW,
  '20': HIGH,
  '23': LOW,
  '26': { score: 1, pinned: true },
};

const build = (
  options: Partial<Parameters<typeof buildTimelineReviewRows<Group>>[0]> = {},
) =>
  buildTimelineReviewRows<Group>({
    groups,
    scores,
    threshold: 0.35,
    openKeys: new Set<string>(),
    showAll: false,
    enabled: true,
    ...options,
  });

const ids = (rows: TimelineRow<Group>[]) => rows.map((row) => row.id);

const layout = (rows: TimelineRow<Group>[], reverseSort = false) => {
  const totalForY = getTotalForY(rows.length, 0, rows.length);
  return rows.map((_, i) =>
    getRowY(i, {
      descStart: rows.length,
      pendingGroupCount: 0,
      totalForY,
      reverseSort,
    }),
  );
};

describe('buildTimelineReviewRows', () => {
  it('returns the groups unchanged when there is no review', () => {
    const result = build({ enabled: false });

    expect(result.rows).toBe(groups);
    expect(result.summary).toBeNull();
    expect(result.routineIds.size).toBe(0);
  });

  it('collapses a run of routine groups into one row with its time range', () => {
    const { rows, summary } = build();

    expect(ids(rows)).toEqual(['1', 'hidden-run-5-11', '20', '23', '26']);
    const run = rows[1];
    expect(isTimelineHiddenRun(run)).toBe(true);
    if (!isTimelineHiddenRun<Group>(run)) return;
    expect(run.count).toBe(3);
    expect(run.open).toBe(false);
    expect(run.startTime).toBe(iso(1_000));
    expect(run.endTime).toBe(iso(1_900));
    expect(run.initialEvent.id).toBe('5');
    expect(summary).toEqual({ total: 7, routine: 3, visible: 4 });
  });

  it('keeps a single routine group, a pinned group and an unscored group visible', () => {
    const { rows } = build({
      scores: { ...scores, '8': undefined as never },
    });

    expect(ids(rows)).toEqual(['1', '5', '8', '11', '20', '23', '26']);
  });

  it('never hides a pending group', () => {
    const pending = groups.map((g) =>
      g.id === '8' ? group(8, 1_300, 1_500, true) : g,
    );

    expect(ids(build({ groups: pending }).rows)).toEqual(
      pending.map((g) => g.id),
    );
  });

  it('changes the version of a run when it opens, so a pooled row updates', () => {
    const closed = build().rows[1];
    const open = build({ openKeys: new Set(['hidden-run-5-11']) }).rows[1];

    expect(closed.version).not.toBe(open.version);
    expect(closed.id).toBe(open.id);
  });

  it('keeps the same run key and time range when the sort order is reversed', () => {
    const { rows } = build({ reverseSort: true });

    expect(ids(rows)).toEqual(['1', 'hidden-run-5-11', '20', '23', '26']);
    const run = rows[1];
    if (!isTimelineHiddenRun<Group>(run)) throw new Error('expected a run');
    expect(run.startTime).toBe(iso(1_000));
    expect(run.endTime).toBe(iso(1_900));
  });
});

describe('timeline geometry from the collapsed row list', () => {
  it('gives each row, including a hidden run, one ROW_HEIGHT with no overlap', () => {
    const { rows } = build();
    const ys = layout(rows);

    expect(ys).toEqual([2, 3, 4, 5, 6].map((n) => n * ROW_HEIGHT));
    expect(new Set(ys).size).toBe(rows.length);
    expect(
      getTimelineHeight({
        rowCount: rows.length,
        pendingGroupCount: 0,
        panelHeight: 0,
      }),
    ).toBe((rows.length + 2) * ROW_HEIGHT);
  });

  it('is shorter than the full timeline by the hidden rows less the run row', () => {
    const full = getTimelineHeight({
      rowCount: groups.length,
      pendingGroupCount: 0,
      panelHeight: 0,
    });
    const collapsed = getTimelineHeight({
      rowCount: build().rows.length,
      pendingGroupCount: 0,
      panelHeight: 0,
    });

    expect(full - collapsed).toBe((3 - 1) * ROW_HEIGHT);
  });

  it('places the toggle row directly above the rows of an open run', () => {
    const { rows } = build({ openKeys: new Set(['hidden-run-5-11']) });
    const ys = layout(rows);

    expect(ids(rows)).toEqual([
      '1',
      'hidden-run-5-11',
      '5',
      '8',
      '11',
      '20',
      '23',
      '26',
    ]);
    expect(ys[2] - ys[1]).toBe(ROW_HEIGHT);
    expect(
      getTimelineHeight({
        rowCount: rows.length,
        pendingGroupCount: 0,
        panelHeight: 0,
      }),
    ).toBe((groups.length + 1 + 2) * ROW_HEIGHT);
  });

  it('keeps the toggle row visually above its rows in descending order', () => {
    // The timeline keeps ascending order and getRowY draws it bottom-up.
    const { rows } = build({
      openKeys: new Set(['hidden-run-5-11']),
      reverseSort: true,
    });
    const ys = layout(rows, true);
    const runIndex = rows.findIndex((row) => isTimelineHiddenRun(row));

    expect(ids(rows)).toEqual([
      '1',
      '5',
      '8',
      '11',
      'hidden-run-5-11',
      '20',
      '23',
      '26',
    ]);
    for (const index of [1, 2, 3]) {
      expect(ys[runIndex]).toBeLessThan(ys[index]);
    }
    expect(ys[runIndex + 1]).toBeLessThan(ys[runIndex]);
    expect(new Set(ys).size).toBe(rows.length);
  });

  it('includes the details panel and the height floor', () => {
    expect(
      getTimelineHeight({ rowCount: 0, pendingGroupCount: 0, panelHeight: 0 }),
    ).toBe(120);
    expect(
      getTimelineHeight({
        rowCount: 10,
        pendingGroupCount: 5,
        panelHeight: 200,
      }),
    ).toBe(17 * ROW_HEIGHT + 200);
  });
});

describe('row collapse with idle-time collapse on', () => {
  it('leaves the time segments unchanged and the rows independent of them', () => {
    const cleanup = $effect.root(() => {
      const workflow = {
        executionTime: iso(0),
        startTime: iso(0),
        endTime: iso(901_000),
      } as unknown as WorkflowExecution;
      const timeline = new Timeline({
        getFullEventHistory: () => [] as WorkflowEvents,
        getWorkflow: () => workflow,
        getLazyGroups: () => groups as unknown as LazyGroup[],
        getCurrentTimeMs: () => T0 + 901_000,
      });

      const before = build();
      const expandedKeys = timeline.segments.map((s) => s.timespan.key);

      timeline.collapseAllSegments();
      expect(timeline.hasCollapsibleSegments).toBe(true);
      expect(timeline.allCollapsibleSegmentsCollapsed).toBe(true);

      const after = build();
      expect(timeline.segments.map((s) => s.timespan.key)).toEqual(
        expandedKeys,
      );
      expect(ids(after.rows)).toEqual(ids(before.rows));
      expect(layout(after.rows)).toEqual(layout(before.rows));

      const run = after.rows[1];
      if (!isTimelineHiddenRun<Group>(run)) throw new Error('expected a run');
      expect(run.startTime).toBe(iso(1_000));
      expect(run.endTime).toBe(iso(1_900));
    });
    cleanup();
  });
});
