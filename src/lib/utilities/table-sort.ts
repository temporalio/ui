import { isTimestamp, timestampToDate } from './format-time';

export type TableSortDirection = 'ascending' | 'descending';
export type TableSortType =
  | 'string'
  | 'number'
  | 'integer'
  | 'datetime'
  | 'boolean';

export type TableSortColumn<T> = {
  getValue: (item: T) => unknown;
  type?: TableSortType;
};

export type TableSort = {
  column: string;
  direction: TableSortDirection;
};

const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
});

function normalize(
  value: unknown,
  type?: TableSortType,
): string | number | bigint | null {
  if (value == null || value === '') return null;

  if (type === 'datetime' || value instanceof Date || isTimestamp(value)) {
    const time = isTimestamp(value)
      ? timestampToDate(value).getTime()
      : value instanceof Date
        ? value.getTime()
        : typeof value === 'string' || typeof value === 'number'
          ? new Date(value).getTime()
          : NaN;
    return Number.isFinite(time) ? time : null;
  }

  if (type === 'integer') {
    // API int64 values are strings. Keep their precision beyond MAX_SAFE_INTEGER.
    if (typeof value === 'bigint') return value;
    if (typeof value === 'string' && /^[+-]?\d+$/.test(value.trim())) {
      return BigInt(value.trim());
    }
    return typeof value === 'number' && Number.isInteger(value) ? value : null;
  }

  if (type === 'number') {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && !value.trim()) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  if (type === 'boolean' || typeof value === 'boolean') {
    if (value === true || value === 'true') return 1;
    if (value === false || value === 'false') return 0;
    return null;
  }

  if (type === 'string')
    return Array.isArray(value) ? value.join(', ') : String(value);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'bigint' || typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  return null;
}

/** Sort a copy of one page; never reorder the API's cached pages. */
export function sortTableItems<T>(
  items: T[],
  column: TableSortColumn<T> | undefined,
  direction: TableSortDirection = 'ascending',
): T[] {
  if (!column) return items;
  const multiplier = direction === 'ascending' ? 1 : -1;

  // Extract/decode each value only once, including custom search attributes.
  return items
    .map((item) => ({
      item,
      value:
        item == null ? null : normalize(column.getValue(item), column.type),
    }))
    .sort((a, b) => {
      // Missing and invalid values stay last in either direction.
      if (a.value === null) return b.value === null ? 0 : 1;
      if (b.value === null) return -1;
      const comparison =
        typeof a.value === 'string' && typeof b.value === 'string'
          ? collator.compare(a.value, b.value)
          : a.value < b.value
            ? -1
            : a.value > b.value
              ? 1
              : 0;
      return comparison * multiplier;
    })
    .map(({ item }) => item);
}
