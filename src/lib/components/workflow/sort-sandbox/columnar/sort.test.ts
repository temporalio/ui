import { describe, expect, it } from 'vitest';

import {
  countingSortU8,
  msdRadixSortStrings,
  radixSortTimestamps,
  type SortDirection,
} from './sort';

const seeded = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const identity = (n: number) => {
  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  return order;
};

/** Stable reference sort, which is what the radix passes must reproduce. */
const referenceStable = <T>(
  n: number,
  compare: (a: number, b: number) => number,
) =>
  Array.from({ length: n }, (_, i) => i)
    .map((row, position) => ({ row, position }))
    .sort((a, b) => compare(a.row, b.row) || a.position - b.position)
    .map((entry) => entry.row);

describe('countingSortU8', () => {
  it.each<SortDirection>(['asc', 'desc'])(
    'sorts %s and is stable',
    (direction) => {
      const n = 5000;
      const random = seeded(7);
      const keys = new Uint8Array(n);
      for (let i = 0; i < n; i++) keys[i] = Math.floor(random() * 6);

      const order = identity(n);
      countingSortU8(order, new Uint32Array(n), keys, direction);

      const expected = referenceStable(n, (a, b) =>
        direction === 'asc' ? keys[a] - keys[b] : keys[b] - keys[a],
      );
      expect(Array.from(order)).toEqual(expected);
    },
  );
});

describe('radixSortTimestamps', () => {
  it.each<SortDirection>(['asc', 'desc'])(
    'orders %s at millisecond precision',
    (direction) => {
      const n = 20_000;
      const random = seeded(11);
      const base = Date.UTC(2026, 6, 1);
      const values = new Float64Array(n);
      // a narrow span forces many rows into the same second, which is exactly
      // where a seconds-truncating key silently loses ordering
      for (let i = 0; i < n; i++) {
        values[i] = base + Math.floor(random() * 60_000);
      }

      const order = identity(n);
      radixSortTimestamps(order, new Uint32Array(n), values, direction);

      const expected = referenceStable(n, (a, b) =>
        direction === 'asc' ? values[a] - values[b] : values[b] - values[a],
      );
      expect(Array.from(order)).toEqual(expected);
    },
  );

  it.each<SortDirection>(['asc', 'desc'])(
    'keeps null rows last when %s',
    (direction) => {
      const n = 4000;
      const random = seeded(13);
      const base = Date.UTC(2026, 6, 1);
      const values = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        values[i] = random() < 0.35 ? 0 : base + Math.floor(random() * 1e7);
      }

      const order = identity(n);
      radixSortTimestamps(order, new Uint32Array(n), values, direction);

      const firstNull = Array.from(order).findIndex((row) => values[row] === 0);
      expect(firstNull).toBeGreaterThan(-1);
      // everything after the first null is also null
      expect(
        Array.from(order)
          .slice(firstNull)
          .every((row) => values[row] === 0),
      ).toBe(true);
      // and the present values are correctly ordered among themselves
      const present = Array.from(order)
        .slice(0, firstNull)
        .map((row) => values[row]);
      const sorted = [...present].sort((a, b) =>
        direction === 'asc' ? a - b : b - a,
      );
      expect(present).toEqual(sorted);
    },
  );

  it('handles a span wider than 32 bits', () => {
    const n = 1000;
    const random = seeded(17);
    const values = new Float64Array(n);
    // ~10 years of milliseconds needs more than four radix passes
    for (let i = 0; i < n; i++) {
      values[i] = Date.UTC(2020, 0, 1) + Math.floor(random() * 3.15e11);
    }

    const order = identity(n);
    radixSortTimestamps(order, new Uint32Array(n), values, 'asc');

    const result = Array.from(order).map((row) => values[row]);
    expect(result).toEqual([...result].sort((a, b) => a - b));
  });
});

describe('msdRadixSortStrings', () => {
  const WIDTH = 32;

  const pack = (values: string[]) => {
    const bytes = new Uint8Array(values.length * WIDTH);
    values.forEach((value, row) => {
      for (let k = 0; k < WIDTH; k++) {
        bytes[row * WIDTH + k] = k < value.length ? value.charCodeAt(k) : 0;
      }
    });
    return bytes;
  };

  it.each<SortDirection>(['asc', 'desc'])(
    'orders %s past a long shared prefix',
    (direction) => {
      const random = seeded(19);
      const prefixes = [
        'order-fulfillment-',
        'payment-processing-',
        'data-export-',
      ];
      const values = Array.from({ length: 6000 }, () => {
        const prefix = prefixes[Math.floor(random() * prefixes.length)];
        return (
          prefix +
          Math.floor(random() * 1e6)
            .toString(16)
            .padStart(6, '0')
        );
      });

      const order = identity(values.length);
      msdRadixSortStrings(
        order,
        new Uint32Array(values.length),
        pack(values),
        WIDTH,
        direction,
      );

      const result = Array.from(order).map((row) => values[row]);
      const expected = [...values].sort((a, b) =>
        direction === 'asc'
          ? a < b
            ? -1
            : a > b
              ? 1
              : 0
          : a > b
            ? -1
            : a < b
              ? 1
              : 0,
      );
      expect(result).toEqual(expected);
    },
  );
});

describe('multi-key sorting', () => {
  it('reproduces a three-key comparator by stacking stable passes', () => {
    const n = 20_000;
    const random = seeded(23);
    const status = new Uint8Array(n);
    const type = new Uint8Array(n);
    const start = new Float64Array(n);
    const base = Date.UTC(2026, 6, 1);

    for (let i = 0; i < n; i++) {
      status[i] = Math.floor(random() * 5);
      type[i] = Math.floor(random() * 8);
      start[i] = base + Math.floor(random() * 120_000);
    }

    const order = identity(n);
    const scratch = new Uint32Array(n);

    // least significant key first
    radixSortTimestamps(order, scratch, start, 'desc');
    countingSortU8(order, scratch, type, 'asc');
    countingSortU8(order, scratch, status, 'asc');

    const expected = referenceStable(
      n,
      (a, b) =>
        status[a] - status[b] || type[a] - type[b] || start[b] - start[a],
    );
    expect(Array.from(order)).toEqual(expected);
  });
});
