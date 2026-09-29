import { describe, expect, it } from 'vitest';

import { getMarkBounds, getNodeAnchorX } from './mark-geometry';

describe('mark geometry', () => {
  it('preserves marks wide enough to contain the icons', () => {
    const bounds = getMarkBounds(100, 200);
    expect(bounds).toEqual({ left: 100, right: 200 });
    expect(getNodeAnchorX(105, bounds, false)).toBe(110);
    expect(getNodeAnchorX(195, bounds, false)).toBe(190);
    expect(getNodeAnchorX(150, bounds, false)).toBe(150);
  });

  it('expands a short mark to contain both endpoint icons at their event times', () => {
    const bounds = getMarkBounds(100, 105);
    expect(bounds).toEqual({ left: 85, right: 120 });
    expect(getNodeAnchorX(100, bounds, true)).toBe(100);
    expect(getNodeAnchorX(105, bounds, true)).toBe(105);
    expect(getNodeAnchorX(100, bounds, false)).toBe(100);
  });

  it('keeps a centered point icon inside its mark', () => {
    const bounds = getMarkBounds(100, 100);
    expect(bounds).toEqual({ left: 80, right: 120 });
    expect(getNodeAnchorX(100, bounds, false)).toBe(100);
  });
});
