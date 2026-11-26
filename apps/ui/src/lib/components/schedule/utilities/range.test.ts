import { describe, expect, it } from 'vitest';

import { compactToRanges, expandRanges } from './range';

describe('expandRanges', () => {
  it('returns an empty array for missing or empty input', () => {
    expect(expandRanges(undefined)).toEqual([]);
    expect(expandRanges(null)).toEqual([]);
    expect(expandRanges([])).toEqual([]);
  });

  it('expands a single-value range to one element', () => {
    expect(expandRanges([{ start: 5 }])).toEqual([5]);
  });

  it('defaults a missing start to zero', () => {
    expect(expandRanges([{ end: 3 }])).toEqual([0, 1, 2, 3]);
  });

  it('expands an inclusive start/end range', () => {
    expect(expandRanges([{ start: 1, end: 5 }])).toEqual([1, 2, 3, 4, 5]);
  });

  it('honors the step', () => {
    expect(expandRanges([{ start: 0, end: 6, step: 2 }])).toEqual([0, 2, 4, 6]);
  });

  it('treats a non-positive step as one', () => {
    expect(expandRanges([{ start: 0, end: 3, step: 0 }])).toEqual([0, 1, 2, 3]);
  });

  it('returns only the start when end is at or before start', () => {
    expect(expandRanges([{ start: 4, end: 4 }])).toEqual([4]);
    expect(expandRanges([{ start: 4, end: 2 }])).toEqual([4]);
  });

  it('merges, dedupes, and sorts multiple ranges', () => {
    expect(
      expandRanges([{ start: 5 }, { start: 1, end: 3 }, { start: 3 }]),
    ).toEqual([1, 2, 3, 5]);
  });
});

describe('compactToRanges', () => {
  it('returns an empty array for no values', () => {
    expect(compactToRanges([])).toEqual([]);
  });

  it('compacts a single value', () => {
    expect(compactToRanges([7])).toEqual([{ start: 7 }]);
  });

  it('compacts consecutive values into a stepless range', () => {
    expect(compactToRanges([1, 2, 3])).toEqual([
      { start: 1, end: 3, step: undefined },
    ]);
  });

  it('compacts an arithmetic progression into a stepped range', () => {
    expect(compactToRanges([0, 2, 4, 6])).toEqual([
      { start: 0, end: 6, step: 2 },
    ]);
  });

  it('dedupes and sorts before compacting', () => {
    expect(compactToRanges([6, 0, 4, 2, 4])).toEqual([
      { start: 0, end: 6, step: 2 },
    ]);
  });

  it('emits consecutive runs when not a single progression', () => {
    expect(compactToRanges([1, 2, 3, 7, 8, 10])).toEqual([
      { start: 1, end: 3 },
      { start: 7, end: 8 },
      { start: 10 },
    ]);
  });

  it('round-trips through expandRanges', () => {
    const values = [1, 2, 3, 7, 8, 10];
    expect(expandRanges(compactToRanges(values))).toEqual(values);

    const progression = [0, 3, 6, 9];
    expect(expandRanges(compactToRanges(progression))).toEqual(progression);
  });
});
