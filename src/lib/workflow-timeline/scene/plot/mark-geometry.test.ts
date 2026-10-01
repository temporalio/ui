import { describe, expect, it } from 'vitest';

import { getMarkGeometry } from './mark-geometry';

describe('mark geometry', () => {
  it('preserves the inward endpoint layout when icons have enough space', () => {
    expect(getMarkGeometry(100, 200, [100, 150, 200], 1000)).toEqual({
      bounds: { left: 100, right: 200 },
      nodeCenters: [110, 150, 190],
    });
  });

  it.each([7000, 80])(
    'keeps the 5 ms lifecycle ordered at a %i ms zoom range',
    (duration) => {
      const positions = [0, 1, 5].map((ms) => 100 + (ms / duration) * 1000);
      const geometry = getMarkGeometry(
        positions[0],
        positions[2],
        positions,
        1000,
      );
      expect(geometry.nodeCenters).toHaveLength(3);
      geometry.nodeCenters.forEach((center, index) => {
        expect(center - 10).toBeGreaterThanOrEqual(geometry.bounds.left);
        expect(center + 10).toBeLessThanOrEqual(geometry.bounds.right);
        if (index > 0) {
          expect(
            center - geometry.nodeCenters[index - 1],
          ).toBeGreaterThanOrEqual(20);
        }
      });
      if (duration === 80) {
        expect(geometry.nodeCenters).toEqual([110, 130, 152.5]);
      }
      expect(positions).toEqual(
        [0, 1, 5].map((ms) => 100 + (ms / duration) * 1000),
      );
    },
  );

  it('orders simultaneous events without overlap', () => {
    expect(getMarkGeometry(100, 100, [100, 100, 100, 100], 1000)).toEqual({
      bounds: { left: 60, right: 140 },
      nodeCenters: [70, 90, 110, 130],
    });
  });

  it('keeps a single event centered on its timestamp', () => {
    expect(getMarkGeometry(100, 100, [100], 1000)).toEqual({
      bounds: { left: 90, right: 110 },
      nodeCenters: [100],
    });
  });

  it.each([0, 32, 968, 1000])(
    'keeps crowded icons within the content at x=%i',
    (x) => {
      const geometry = getMarkGeometry(x, x, [x, x, x], 1000);
      expect(geometry.bounds.left).toBeGreaterThanOrEqual(0);
      expect(geometry.bounds.right).toBeLessThanOrEqual(1000);
      expect(geometry.nodeCenters[1] - geometry.nodeCenters[0]).toBe(20);
      expect(geometry.nodeCenters[2] - geometry.nodeCenters[1]).toBe(20);
    },
  );

  it('does not expand the duration of an ongoing lifecycle to match icon spacing', () => {
    expect(getMarkGeometry(100, 500, [100, 101, 105], 1000)).toEqual({
      bounds: { left: 72.5, right: 500 },
      nodeCenters: [82.5, 102.5, 122.5],
    });
  });

  it('handles an empty event list', () => {
    expect(getMarkGeometry(100, 200, [], 1000)).toEqual({
      bounds: { left: 100, right: 200 },
      nodeCenters: [],
    });
  });
});
