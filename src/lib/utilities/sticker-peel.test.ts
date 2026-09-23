import { describe, expect, it } from 'vitest';

import {
  applyMatrix,
  computePeel,
  peelProgress,
  toClipPath,
} from './sticker-peel';

const WIDTH = 200;
const HEIGHT = 80;
const CORNER = { x: WIDTH, y: HEIGHT };

describe('computePeel', () => {
  it('keeps the whole sticker when the pointer is on the corner', () => {
    const peel = computePeel(WIDTH, HEIGHT, CORNER, CORNER);
    expect(peel.front).toHaveLength(4);
    expect(peel.flap).toEqual([]);
  });

  it('folds the corner onto the pointer', () => {
    const pointer = { x: 150, y: 50 };
    const peel = computePeel(WIDTH, HEIGHT, CORNER, pointer);
    const folded = applyMatrix(peel.matrix, CORNER);
    expect(folded.x).toBeCloseTo(pointer.x);
    expect(folded.y).toBeCloseTo(pointer.y);
  });

  it('removes the corner from the front and adds it to the flap', () => {
    const peel = computePeel(WIDTH, HEIGHT, CORNER, { x: 150, y: 50 });
    expect(peel.front).not.toContainEqual(CORNER);
    expect(peel.flap).toContainEqual(CORNER);
    expect(peel.front).toContainEqual({ x: 0, y: 0 });
  });

  it('leaves nothing on the front past the opposite corner', () => {
    const peel = computePeel(WIDTH, HEIGHT, CORNER, {
      x: -WIDTH - 12,
      y: -HEIGHT - 12,
    });
    expect(peel.front).toEqual([]);
    expect(peel.flap).toHaveLength(4);
  });
});

describe('peelProgress', () => {
  it('is 0 at the corner and 1 past the opposite corner', () => {
    expect(peelProgress(WIDTH, HEIGHT, CORNER, CORNER)).toBe(0);
    expect(peelProgress(WIDTH, HEIGHT, CORNER, { x: -WIDTH, y: -HEIGHT })).toBe(
      1,
    );
  });
});

describe('toClipPath', () => {
  it('formats a polygon in pixels', () => {
    expect(
      toClipPath([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 5 },
      ]),
    ).toBe('polygon(0px 0px, 10px 0px, 10px 5px)');
  });

  it('returns an empty polygon without points', () => {
    expect(toClipPath([])).toBe('polygon(0 0, 0 0, 0 0)');
  });
});
