import { describe, expect, test } from 'vitest';

import {
  clampColumnWidth,
  COLUMN_WIDTH_CLAMP_CLASSES,
  columnResizeActionForKey,
  columnWidthStyle,
  KEYBOARD_RESIZE_STEP,
} from './column-width';

const MIN = 80;

describe('clampColumnWidth', () => {
  test('rounds fractional widths', () => {
    expect(clampColumnWidth(240.6, MIN)).toBe(241);
  });

  test('never returns less than the minimum', () => {
    expect(clampColumnWidth(10, MIN)).toBe(MIN);
    expect(clampColumnWidth(-100, MIN)).toBe(MIN);
  });
});

describe('columnResizeActionForKey', () => {
  test('ArrowRight grows the column by one step', () => {
    expect(columnResizeActionForKey('ArrowRight', 200, MIN)).toEqual({
      type: 'resize',
      width: 200 + KEYBOARD_RESIZE_STEP,
    });
  });

  test('ArrowLeft shrinks the column by one step', () => {
    expect(columnResizeActionForKey('ArrowLeft', 200, MIN)).toEqual({
      type: 'resize',
      width: 200 - KEYBOARD_RESIZE_STEP,
    });
  });

  test('shrinking stops at the minimum width', () => {
    expect(columnResizeActionForKey('ArrowLeft', MIN, MIN)).toEqual({
      type: 'resize',
      width: MIN,
    });
  });

  test('Enter and Space return the column to autosizing', () => {
    expect(columnResizeActionForKey('Enter', 200, MIN)).toEqual({
      type: 'reset',
    });
    expect(columnResizeActionForKey(' ', 200, MIN)).toEqual({ type: 'reset' });
  });

  test('ignores keys it does not handle', () => {
    expect(columnResizeActionForKey('Tab', 200, MIN)).toEqual({
      type: 'ignore',
    });
    expect(columnResizeActionForKey('Escape', 200, MIN)).toEqual({
      type: 'ignore',
    });
  });
});

describe('columnWidthStyle', () => {
  test('pins the width in all three dimensions so auto layout cannot grow the column', () => {
    expect(columnWidthStyle(240)).toBe(
      'width: 240px; min-width: 240px; max-width: 240px',
    );
  });

  test('returns no style for an autosizing column', () => {
    expect(columnWidthStyle(undefined)).toBeUndefined();
  });
});

describe('COLUMN_WIDTH_CLAMP_CLASSES', () => {
  test('clamps the cell and its link and tooltip children', () => {
    expect(COLUMN_WIDTH_CLAMP_CLASSES).toContain('overflow-hidden');
    expect(COLUMN_WIDTH_CLAMP_CLASSES).toContain('text-ellipsis');
    expect(COLUMN_WIDTH_CLAMP_CLASSES).toContain('[&_a]:overflow-hidden');
    expect(COLUMN_WIDTH_CLAMP_CLASSES).toContain(
      '[&_.wrapper]:overflow-hidden',
    );
  });
});
