import { describe, expect, it } from 'vitest';

import type { WorkflowExecution } from '$lib/types/workflows';

import { createVisibleRows } from './visible-rows';

const workflow = (runId: string) => ({ runId }) as WorkflowExecution;

describe('workflow table visible rows', () => {
  it('reorders existing rows and keeps expanded children with their parent', () => {
    const rowsFor = createVisibleRows();
    const first = workflow('first');
    const second = workflow('second');
    const child = workflow('child');
    const children = new Map([[first.runId, [child]]]);
    const before = rowsFor([first, second], children);
    const after = rowsFor([second, first], children);

    expect(after.map((row) => row.value.runId)).toEqual([
      'second',
      'first',
      'child',
    ]);
    expect(after[0]).toBe(before[2]);
    expect(after[1]).toBe(before[0]);
    expect(after[2]).toBe(before[1]);
    expect(after[2]).toMatchObject({
      rowType: 'child',
      parentRow: after[1],
    });
  });

  it('updates child counts and parent references on expansion and collapse', () => {
    const rowsFor = createVisibleRows();
    const parent = workflow('parent');
    const firstChild = workflow('first-child');
    const secondChild = workflow('second-child');
    const children = new Map<string, WorkflowExecution[]>();

    expect(rowsFor([parent], children)[0]).toMatchObject({
      childCount: undefined,
    });
    children.set(parent.runId, []);
    expect(rowsFor([parent], children)[0]).toMatchObject({ childCount: 0 });
    children.set(parent.runId, [firstChild]);
    const expanded = rowsFor([parent], children);
    expect(expanded[0]).toMatchObject({ childCount: 1 });

    children.set(parent.runId, [firstChild, secondChild]);
    const updated = rowsFor([parent], children);
    expect(updated[0]).toMatchObject({ childCount: 2 });
    expect(updated[0]).not.toBe(expanded[0]);
    for (const row of updated.slice(1)) {
      expect(row.rowType).toBe('child');
      if (row.rowType === 'child') expect(row.parentRow).toBe(updated[0]);
    }

    children.clear();
    const collapsed = rowsFor([parent], children);
    expect(collapsed).toHaveLength(1);
    expect(collapsed[0]).toMatchObject({ childCount: undefined });
  });

  it('uses refreshed workflow and child data even when run IDs are unchanged', () => {
    const rowsFor = createVisibleRows();
    const parent = workflow('parent');
    const child = workflow('child');
    const before = rowsFor([parent], new Map([[parent.runId, [child]]]));
    const refreshedParent = { ...parent, name: 'Updated workflow' };
    const refreshedChild = { ...child, name: 'Updated child' };
    const after = rowsFor(
      [refreshedParent],
      new Map([[parent.runId, [refreshedChild]]]),
    );

    expect(after[0]).not.toBe(before[0]);
    expect(after[0].value).toBe(refreshedParent);
    expect(after[1]).not.toBe(before[1]);
    expect(after[1].value).toBe(refreshedChild);
    if (after[1].rowType === 'child') {
      expect(after[1].parentRow).toBe(after[0]);
    }
  });
});
