import { describe, expect, test } from 'vitest';

import {
  getBatchSelectionTargets,
  getPageSelectionStatus,
} from './batch-selection';

describe('getPageSelectionStatus', () => {
  test('returns checked when allSelected is true regardless of visible items', () => {
    expect(getPageSelectionStatus(['a', 'b'], new Set(), true)).toBe('checked');
  });

  test('returns unchecked when there are no visible items', () => {
    expect(getPageSelectionStatus([], new Set(['a']), false)).toBe('unchecked');
  });

  test('returns unchecked when none of the visible items are selected', () => {
    expect(getPageSelectionStatus(['a', 'b'], new Set(['c']), false)).toBe(
      'unchecked',
    );
  });

  test('returns checked when all visible items are selected', () => {
    expect(
      getPageSelectionStatus(['a', 'b'], new Set(['a', 'b', 'c']), false),
    ).toBe('checked');
  });

  test('returns partial when some but not all visible items are selected', () => {
    expect(getPageSelectionStatus(['a', 'b'], new Set(['a']), false)).toBe(
      'partial',
    );
  });
});

describe('getBatchSelectionTargets', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  const makeEvent = ({
    checked = true,
    shiftKey = false,
    isCheckbox = true,
  }: {
    checked?: boolean;
    shiftKey?: boolean;
    isCheckbox?: boolean;
  } = {}): MouseEvent => {
    let currentTarget: EventTarget | null = null;
    if (isCheckbox) {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = checked;
      currentTarget = input;
    }

    return { shiftKey, currentTarget } as unknown as MouseEvent;
  };

  test('returns null when the event target is not a checkbox input', () => {
    expect(
      getBatchSelectionTargets(
        makeEvent({ isCheckbox: false }),
        items,
        2,
        null,
      ),
    ).toBeNull();
  });

  test('targets a single item when not shift-clicking', () => {
    expect(getBatchSelectionTargets(makeEvent(), items, 2, null)).toEqual({
      isChecked: true,
      targeted: ['c'],
    });
  });

  test('reflects the checkbox checked state', () => {
    expect(
      getBatchSelectionTargets(makeEvent({ checked: false }), items, 2, null),
    ).toEqual({
      isChecked: false,
      targeted: ['c'],
    });
  });

  test('targets a single item when shift-clicking with no previous index', () => {
    expect(
      getBatchSelectionTargets(makeEvent({ shiftKey: true }), items, 2, null),
    ).toEqual({
      isChecked: true,
      targeted: ['c'],
    });
  });

  test('targets the inclusive range when shift-clicking forward', () => {
    expect(
      getBatchSelectionTargets(makeEvent({ shiftKey: true }), items, 3, 1),
    ).toEqual({
      isChecked: true,
      targeted: ['b', 'c', 'd'],
    });
  });

  test('targets the inclusive range when shift-clicking backward', () => {
    expect(
      getBatchSelectionTargets(makeEvent({ shiftKey: true }), items, 1, 3),
    ).toEqual({
      isChecked: true,
      targeted: ['b', 'c', 'd'],
    });
  });

  test('ignores a negative previous index (e.g. runId lookup miss)', () => {
    expect(
      getBatchSelectionTargets(makeEvent({ shiftKey: true }), items, 2, -1),
    ).toEqual({
      isChecked: true,
      targeted: ['c'],
    });
  });
});
