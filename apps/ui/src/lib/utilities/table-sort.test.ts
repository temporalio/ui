import { describe, expect, it } from 'vitest';

import { sortTableItems, type TableSortType } from './table-sort';

const sort = (
  values: unknown[],
  type?: TableSortType,
  direction: 'ascending' | 'descending' = 'ascending',
) => sortTableItems(values, { getValue: (value) => value, type }, direction);

describe('sortTableItems', () => {
  it('sorts numbers numerically in both directions without changing the source', () => {
    const values = [10, -2, 1.5, 0];
    expect(sort(values)).toEqual([-2, 0, 1.5, 10]);
    expect(sort(values, 'number', 'descending')).toEqual([10, 1.5, 0, -2]);
    expect(values).toEqual([10, -2, 1.5, 0]);
  });

  it('sorts API integer strings without losing int64 precision', () => {
    expect(
      sort(
        ['9007199254740993', '10', '9007199254740992', '-2', '0'],
        'integer',
      ),
    ).toEqual(['-2', '0', '10', '9007199254740992', '9007199254740993']);
  });

  it('sorts decimal strings as numbers only when the column declares that type', () => {
    expect(sort(['10', '2.5', '-1.2'], 'number')).toEqual([
      '-1.2',
      '2.5',
      '10',
    ]);
  });

  it('sorts embedded numbers in strings naturally', () => {
    expect(sort(['order-10', 'order-2', 'order-1'], 'string')).toEqual([
      'order-1',
      'order-2',
      'order-10',
    ]);
    expect(sort(['10', '2'])).toEqual(['2', '10']);
  });

  it('keeps missing items last instead of reading from them', () => {
    const items = [{ name: 'b' }, undefined, { name: 'a' }];
    expect(
      sortTableItems(items, {
        getValue: (item) => (item as { name: string }).name,
        type: 'string',
      }),
    ).toEqual([{ name: 'a' }, { name: 'b' }, undefined]);
  });

  it('sorts strings alphabetically, keeping equal values in their original order', () => {
    expect(sort(['Zulu', 'alpha', 'Alpha', 'beta'], 'string')).toEqual([
      'alpha',
      'Alpha',
      'beta',
      'Zulu',
    ]);
    expect(
      sort(['Zulu', 'alpha', 'Alpha', 'beta'], 'string', 'descending'),
    ).toEqual(['Zulu', 'beta', 'alpha', 'Alpha']);
  });

  it('compares dates by instant, including time zones and protobuf timestamps', () => {
    const values = [
      '2026-01-01T01:00:00+02:00',
      '2026-01-01T00:00:00Z',
      new Date('2025-12-31T22:00:00Z'),
      { seconds: '1767227400', nanos: 0 },
    ];
    expect(sort(values, 'datetime')).toEqual([
      values[2],
      values[0],
      values[1],
      values[3],
    ]);
  });

  it('sorts booleans and keyword lists', () => {
    expect(sort([true, false], 'boolean')).toEqual([false, true]);
    expect(sort(['true', 'false'], 'boolean')).toEqual(['false', 'true']);
    expect(sort([['z'], ['a', 'b']], 'string')).toEqual([['a', 'b'], ['z']]);
  });

  it.each(['ascending', 'descending'] as const)(
    'keeps missing and invalid values last when %s',
    (direction) => {
      const missing = [null, undefined, '', NaN, 'invalid', ' '];
      expect(
        sort([missing[0], 2, ...missing.slice(1), 0], 'number', direction),
      ).toEqual([...(direction === 'ascending' ? [0, 2] : [2, 0]), ...missing]);
      expect(sort(['invalid', '2026-01-01'], 'datetime', direction)).toEqual([
        '2026-01-01',
        'invalid',
      ]);
    },
  );

  it('preserves the original page when no column is selected', () => {
    const items = [2, 1];
    expect(sortTableItems(items, undefined)).toBe(items);
  });
});
