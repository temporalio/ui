import { get } from 'svelte/store';

import { describe, expect, test } from 'vitest';

import { createBatchSelection } from './batch-selection';

type Item = { id: string; name: string };
const getId = (item: Item) => item.id;

const a: Item = { id: 'a', name: 'a' };
const b: Item = { id: 'b', name: 'b' };
const c: Item = { id: 'c', name: 'c' };

describe('createBatchSelection', () => {
  test('starts empty with batch actions hidden', () => {
    const selection = createBatchSelection(getId);
    expect(get(selection.allSelected)).toBe(false);
    expect(get(selection.selectedItems)).toEqual([]);
    expect(get(selection.batchActionsVisible)).toBe(false);
  });

  test('selectItems adds items and makes batch actions visible', () => {
    const selection = createBatchSelection(getId);
    selection.selectItems(true, [a, b]);
    expect(get(selection.selectedItems)).toEqual([a, b]);
    expect(get(selection.batchActionsVisible)).toBe(true);
  });

  test('selectItems is additive and de-duplicates by id', () => {
    const selection = createBatchSelection(getId);
    selection.selectItems(true, [a]);
    selection.selectItems(true, [a, b]);
    expect(get(selection.selectedItems)).toEqual([a, b]);
  });

  test('selectItems with checked=false removes only the given items', () => {
    const selection = createBatchSelection(getId);
    selection.selectItems(true, [a, b, c]);
    selection.selectItems(false, [b]);
    expect(get(selection.selectedItems)).toEqual([a, c]);
  });

  test('handleSelectAll selects all items and sets allSelected', () => {
    const selection = createBatchSelection(getId);
    selection.handleSelectAll([a, b, c]);
    expect(get(selection.allSelected)).toBe(true);
    expect(get(selection.selectedItems)).toEqual([a, b, c]);
  });

  test('reset clears selection', () => {
    const selection = createBatchSelection(getId);
    selection.handleSelectAll([a, b]);
    selection.reset();
    expect(get(selection.allSelected)).toBe(false);
    expect(get(selection.selectedItems)).toEqual([]);
    expect(get(selection.batchActionsVisible)).toBe(false);
  });
});
