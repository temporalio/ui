import { describe, expect, it } from 'vitest';

import {
  collapseRoutineRows,
  hiddenRunKey,
  type HiddenRunRow,
  isHiddenRunRow,
  type ReviewRowScore,
} from './history-review-collapse';

type Row = { id: string; groupId?: string; pendingRow?: boolean };

const LOW = { score: 0.1 };
const HIGH = { score: 0.9 };
const PINNED = { score: 0.1, pinned: true };

const rowsOf = (...ids: number[]): Row[] => ids.map((id) => ({ id: `${id}` }));

const collapse = (
  rows: Row[],
  scores: Record<string, ReviewRowScore>,
  {
    openKeys = new Set<string>(),
    showAll = false,
  }: { openKeys?: Set<string>; showAll?: boolean } = {},
) =>
  collapseRoutineRows<Row>({
    rows,
    getId: (row) => (row.pendingRow ? undefined : row.id),
    getScore: (row) => scores[row.id] ?? scores[row.groupId ?? ''],
    threshold: 0.35,
    openKeys,
    showAll,
  });

const describeRows = (rows: (Row | HiddenRunRow<Row>)[]) =>
  rows.map((row) =>
    isHiddenRunRow(row) ? `${row.key}:${row.count}:${row.open}` : row.id,
  );

describe('collapseRoutineRows', () => {
  it('collapses a run of consecutive low rows into one hidden-run row', () => {
    const scores = { 1: PINNED, 2: LOW, 3: LOW, 4: LOW, 5: HIGH, 6: PINNED };
    const result = collapse(rowsOf(1, 2, 3, 4, 5, 6), scores);

    expect(describeRows(result.rows)).toEqual([
      '1',
      'hidden-run-2-4:3:false',
      '5',
      '6',
    ]);
    expect(result.rows[1]).toEqual({
      kind: 'hidden-run',
      key: 'hidden-run-2-4',
      count: 3,
      firstId: '2',
      lastId: '4',
      open: false,
      rows: rowsOf(2, 3, 4),
    });
    expect(result.summary).toEqual({ total: 6, routine: 3, visible: 3 });
  });

  it('keeps a single low row visible', () => {
    const result = collapse(rowsOf(1, 2, 3), { 1: HIGH, 2: LOW, 3: HIGH });

    expect(describeRows(result.rows)).toEqual(['1', '2', '3']);
    expect(result.routineIds.size).toBe(0);
    expect(result.summary).toEqual({ total: 3, routine: 0, visible: 3 });
  });

  it('always shows a row with no score and lets it split a run', () => {
    const scores = { 1: LOW, 2: LOW, 4: LOW, 5: LOW, 6: LOW };
    const result = collapse(rowsOf(1, 2, 3, 4, 5, 6, 7), scores);

    expect(describeRows(result.rows)).toEqual([
      'hidden-run-1-2:2:false',
      '3',
      'hidden-run-4-6:3:false',
      '7',
    ]);
  });

  it('always shows a pinned row', () => {
    const result = collapse(rowsOf(1, 2, 3), { 1: LOW, 2: PINNED, 3: LOW });

    expect(describeRows(result.rows)).toEqual(['1', '2', '3']);
  });

  it('always shows a row that has no id, such as a pending activity row', () => {
    const rows: Row[] = [
      { id: '1' },
      { id: '2' },
      { id: '2', pendingRow: true },
      { id: '3' },
    ];
    const result = collapse(rows, { 1: LOW, 2: LOW, 3: LOW });

    expect(describeRows(result.rows)).toEqual([
      'hidden-run-1-2:2:false',
      '2',
      '3',
    ]);
  });

  it('treats a score equal to the threshold as not routine', () => {
    const result = collapse(rowsOf(1, 2), {
      1: { score: 0.35 },
      2: { score: 0.35 },
    });

    expect(describeRows(result.rows)).toEqual(['1', '2']);
  });

  it('keeps the toggle row above the rows of an open run', () => {
    const scores = { 1: HIGH, 2: LOW, 3: LOW, 4: HIGH };
    const result = collapse(rowsOf(1, 2, 3, 4), scores, {
      openKeys: new Set(['hidden-run-2-3']),
    });

    expect(describeRows(result.rows)).toEqual([
      '1',
      'hidden-run-2-3:2:true',
      '2',
      '3',
      '4',
    ]);
    expect([...result.routineIds]).toEqual(['2', '3']);
    expect(result.summary).toEqual({ total: 4, routine: 2, visible: 2 });
  });

  it('keeps run keys stable when the sort order changes', () => {
    const scores = { 1: HIGH, 2: LOW, 3: LOW, 4: LOW, 5: HIGH };
    const openKeys = new Set(['hidden-run-2-4']);
    const ascending = collapse(rowsOf(1, 2, 3, 4, 5), scores, { openKeys });
    const descending = collapse(rowsOf(5, 4, 3, 2, 1), scores, { openKeys });

    expect(describeRows(ascending.rows)).toEqual([
      '1',
      'hidden-run-2-4:3:true',
      '2',
      '3',
      '4',
      '5',
    ]);
    expect(describeRows(descending.rows)).toEqual([
      '5',
      'hidden-run-2-4:3:true',
      '4',
      '3',
      '2',
      '1',
    ]);
    const run = descending.rows[1] as HiddenRunRow<Row>;
    expect(run.rows.map((row) => row.id)).toEqual(['4', '3', '2']);
    expect([run.firstId, run.lastId]).toEqual(['2', '4']);
  });

  it('puts the toggle row after the rows of an open run on request', () => {
    const scores = { 1: HIGH, 2: LOW, 3: LOW, 4: HIGH };
    const result = collapseRoutineRows<Row>({
      rows: rowsOf(1, 2, 3, 4),
      getId: (row) => row.id,
      getScore: (row) => scores[row.id as unknown as keyof typeof scores],
      threshold: 0.35,
      openKeys: new Set(['hidden-run-2-3']),
      showAll: false,
      togglePosition: 'after',
    });

    expect(describeRows(result.rows)).toEqual([
      '1',
      '2',
      '3',
      'hidden-run-2-3:2:true',
      '4',
    ]);
  });

  it('keeps the pinned first and last row of the history visible in both sort orders', () => {
    const scores = { 1: PINNED, 2: LOW, 3: LOW, 4: LOW, 5: PINNED };
    const ascending = collapse(rowsOf(1, 2, 3, 4, 5), scores);
    const descending = collapse(rowsOf(5, 4, 3, 2, 1), scores);

    expect(describeRows(ascending.rows)).toEqual([
      '1',
      'hidden-run-2-4:3:false',
      '5',
    ]);
    expect(describeRows(descending.rows)).toEqual([
      '5',
      'hidden-run-2-4:3:false',
      '1',
    ]);
  });

  it('collapses across a 1000-item call boundary when nothing there is pinned', () => {
    const ids = Array.from({ length: 1200 }, (_, i) => i + 1);
    const scores = Object.fromEntries(
      ids.map((id) => [id, id === 1 || id === 1200 ? PINNED : LOW]),
    );
    const result = collapse(rowsOf(...ids), scores);

    expect(describeRows(result.rows)).toEqual([
      '1',
      'hidden-run-2-1199:1198:false',
      '1200',
    ]);
    expect(result.routineIds.has('999')).toBe(true);
    expect(result.routineIds.has('1000')).toBe(true);
    expect(result.routineIds.has('1001')).toBe(true);
  });

  it('sorts run ids as numbers', () => {
    expect(hiddenRunKey('10', '9')).toBe('hidden-run-9-10');
  });

  it('adds no hidden-run row when showAll is on, and still marks routine rows', () => {
    const scores = { 1: HIGH, 2: LOW, 3: LOW, 4: HIGH };
    const result = collapse(rowsOf(1, 2, 3, 4), scores, { showAll: true });

    expect(describeRows(result.rows)).toEqual(['1', '2', '3', '4']);
    expect([...result.routineIds]).toEqual(['2', '3']);
    expect(result.summary).toEqual({ total: 4, routine: 2, visible: 2 });
  });

  it('lets an event inherit the score of its group', () => {
    const rows: Row[] = [
      { id: '1' },
      { id: '5', groupId: '5' },
      { id: '6', groupId: '5' },
      { id: '7', groupId: '5' },
      { id: '8' },
    ];
    const result = collapse(rows, { 1: HIGH, 5: LOW, 8: HIGH });

    expect(describeRows(result.rows)).toEqual([
      '1',
      'hidden-run-5-7:3:false',
      '8',
    ]);
  });

  it('returns the input rows when there are no scores', () => {
    const rows = rowsOf(1, 2, 3);
    const result = collapse(rows, {});

    expect(result.rows).toEqual(rows);
    expect(result.summary).toEqual({ total: 3, routine: 0, visible: 3 });
  });
});
