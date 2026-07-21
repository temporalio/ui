import { describe, expect, test } from 'vitest';

import { getPageSelectionStatus } from './batch-selection';

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
