import { describe, expect, it } from 'vitest';

import { isModifiedClick } from './is-modified-click';

const click = (init: Partial<MouseEvent> = {}) =>
  ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    ...init,
  }) as MouseEvent;

describe('isModifiedClick', () => {
  it('should return false for an unmodified primary click', () => {
    expect(isModifiedClick(click())).toBe(false);
  });

  it('should return false without an event', () => {
    expect(isModifiedClick(undefined)).toBe(false);
  });

  it.each([
    ['meta', { metaKey: true }],
    ['ctrl', { ctrlKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
  ])('should return true for a %s click', (_, init) => {
    expect(isModifiedClick(click(init))).toBe(true);
  });

  it('should return true for a non-primary button', () => {
    expect(isModifiedClick(click({ button: 1 }))).toBe(true);
  });
});
