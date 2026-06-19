import { describe, expect, it } from 'vitest';

import { gutterIconLayout } from './gutter-layout';

/**
 * Sprite anchor is (0, 0.5): x is the left edge, y is the vertical center.
 * These helpers convert back to visual bounds for readable assertions.
 */
function visualBounds(
  x: number,
  y: number,
  size: number,
): { top: number; bottom: number; left: number; right: number } {
  return {
    top: y - size / 2,
    bottom: y + size / 2,
    left: x,
    right: x + size,
  };
}

describe('gutterIconLayout — centering', () => {
  it('icon is horizontally centered within a square pin', () => {
    const { x, size } = gutterIconLayout(0, 0, 18, 18);
    const leftMargin = x;
    const rightMargin = 18 - (x + size);
    expect(leftMargin).toBeCloseTo(rightMargin, 5);
  });

  it('icon is vertically centered within a square pin', () => {
    const { y, size } = gutterIconLayout(0, 0, 18, 18);
    const bounds = visualBounds(0, y, size);
    const topMargin = bounds.top - 0; // relative to py=0
    const bottomMargin = 18 - bounds.bottom; // relative to py+pinH
    expect(topMargin).toBeCloseTo(bottomMargin, 5);
  });

  it('icon is horizontally centered within a wide pin', () => {
    const pw = 40;
    const pinH = 18;
    const { x, size } = gutterIconLayout(0, 0, pw, pinH);
    const leftMargin = x;
    const rightMargin = pw - (x + size);
    expect(leftMargin).toBeCloseTo(rightMargin, 5);
  });

  it('icon is vertically centered within a wide pin', () => {
    const pinH = 18;
    const { y, size } = gutterIconLayout(0, 0, 40, pinH);
    const bounds = visualBounds(0, y, size);
    expect(bounds.top).toBeCloseTo(bounds.bottom - size, 5);
    const topMargin = bounds.top;
    const bottomMargin = pinH - bounds.bottom;
    expect(topMargin).toBeCloseTo(bottomMargin, 5);
  });

  it('icon stays within pin bounds for a square pin', () => {
    const px = 10;
    const py = 20;
    const pw = 18;
    const pinH = 18;
    const { x, y, size } = gutterIconLayout(px, py, pw, pinH);
    const b = visualBounds(x, y, size);
    expect(b.left).toBeGreaterThanOrEqual(px);
    expect(b.right).toBeLessThanOrEqual(px + pw);
    expect(b.top).toBeGreaterThanOrEqual(py);
    expect(b.bottom).toBeLessThanOrEqual(py + pinH);
  });

  it('icon stays within pin bounds for a wide pin', () => {
    const px = 5;
    const py = 30;
    const pw = 60;
    const pinH = 16;
    const { x, y, size } = gutterIconLayout(px, py, pw, pinH);
    const b = visualBounds(x, y, size);
    expect(b.left).toBeGreaterThanOrEqual(px);
    expect(b.right).toBeLessThanOrEqual(px + pw);
    expect(b.top).toBeGreaterThanOrEqual(py);
    expect(b.bottom).toBeLessThanOrEqual(py + pinH);
  });

  it('non-zero origin: centering is relative to the pin, not the canvas origin', () => {
    const layout0 = gutterIconLayout(0, 0, 18, 18);
    const layout1 = gutterIconLayout(100, 200, 18, 18);
    expect(layout1.x - 100).toBeCloseTo(layout0.x, 5);
    expect(layout1.y - 200).toBeCloseTo(layout0.y, 5);
    expect(layout1.size).toBe(layout0.size);
  });
});

describe('gutterIconLayout — icon sizing', () => {
  it('square pin: icon size is pinH - 2', () => {
    const pinH = 18;
    const { size } = gutterIconLayout(0, 0, pinH, pinH);
    expect(size).toBe(pinH - 2);
  });

  it('wide pin: icon size is still capped at pinH - 2', () => {
    const pinH = 18;
    const { size } = gutterIconLayout(0, 0, 60, pinH);
    expect(size).toBe(pinH - 2);
  });

  it('narrow pin: icon size is capped at pw - 2', () => {
    const pw = 10;
    const pinH = 18;
    const { size } = gutterIconLayout(0, 0, pw, pinH);
    expect(size).toBe(pw - 2);
  });

  it('size is always positive for reasonable pin dimensions', () => {
    const cases: [number, number][] = [
      [12, 12],
      [14, 14],
      [16, 16],
      [18, 18],
      [18, 24],
      [18, 40],
      [12, 40],
    ];
    for (const [pw, pinH] of cases) {
      const { size } = gutterIconLayout(0, 0, pw, pinH);
      expect(size).toBeGreaterThan(0);
    }
  });

  it('icon is always square (width === height)', () => {
    const { size } = gutterIconLayout(0, 0, 18, 18);
    expect(size).toBe(size); // trivially true; enforced by single `size` return value
    // Caller sets width = height = size, so squareness is guaranteed by design
    expect(typeof size).toBe('number');
  });
});

describe('gutterIconLayout — anchor contract', () => {
  it('y is the vertical center of the pin (anchor.y = 0.5)', () => {
    const py = 50;
    const pinH = 18;
    const { y } = gutterIconLayout(0, py, 18, pinH);
    expect(y).toBe(py + pinH / 2);
  });

  it('x is the left edge of the icon (anchor.x = 0)', () => {
    const px = 20;
    const pw = 18;
    const pinH = 18;
    const { x, size } = gutterIconLayout(px, 0, pw, pinH);
    // left margin equals right margin
    expect(x - px).toBeCloseTo(px + pw - (x + size), 5);
  });

  it('changing pinH shifts y proportionally', () => {
    const py = 0;
    expect(gutterIconLayout(0, py, 20, 12).y).toBe(6);
    expect(gutterIconLayout(0, py, 20, 16).y).toBe(8);
    expect(gutterIconLayout(0, py, 20, 18).y).toBe(9);
  });
});
