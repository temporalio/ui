import { describe, expect, it } from 'vitest';

import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
} from '$lib/types/workflows';

import {
  getColumnAttribute,
  type QuickFilterColumns,
  resolveQuickFilter,
} from './quick-filter-table';

type Row = { status: string; start: string; count: string; tags: string[] };

const row: Row = {
  status: 'Completed',
  start: '2024-01-02T03:04:05.678901234Z',
  count: '17',
  tags: ['a', 'b'],
};

const columns: QuickFilterColumns<Row> = {
  attributes: {
    Status: 'ExecutionStatus',
    Start: 'StartTime',
    'History Length': 'HistoryLength',
    Tags: 'CustomKeywordListField',
    Nothing: 'NotIndexed',
  },
  getValue: (label, row) => {
    switch (label) {
      case 'Status':
        return row.status;
      case 'Start':
        return row.start;
      case 'History Length':
        return row.count;
      case 'Tags':
        return row.tags;
      default:
        return undefined;
    }
  },
  unfilterable: ['Status'],
};

const searchAttributes: SearchAttributes = {
  ExecutionStatus: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  StartTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
  HistoryLength: SEARCH_ATTRIBUTE_TYPE.INT,
  CustomKeywordListField: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
};

const resolve = (label: string) =>
  resolveQuickFilter({ columns, searchAttributes, label, row });

describe('getColumnAttribute', () => {
  it('maps a label to its attribute', () => {
    expect(getColumnAttribute(columns.attributes, 'Start')).toBe('StartTime');
  });

  it('treats an unmapped label as a custom attribute of the same name', () => {
    expect(getColumnAttribute(columns.attributes, 'MyField')).toBe('MyField');
  });
});

describe('resolveQuickFilter', () => {
  it('resolves a keyword column', () => {
    expect(resolve('Tags')).toMatchObject({
      attribute: 'CustomKeywordListField',
      type: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
      filterValue: '("a", "b")',
      filterable: true,
    });
  });

  it('shows and copies a Datetime as the normalized value, not the raw field', () => {
    const resolved = resolve('Start');
    expect(resolved.filterValue).toBe(row.start);
    expect(resolved.displayValue).toBe(row.start);
  });

  it('stringifies any other value for display', () => {
    expect(resolve('History Length').displayValue).toBe('17');
  });

  it('is not filterable when the column has no value', () => {
    expect(resolve('Nothing')).toMatchObject({
      filterValue: null,
      filterable: false,
      displayValue: '',
    });
  });

  it('is not filterable when the column has no known type', () => {
    const resolved = resolveQuickFilter({
      columns,
      searchAttributes: {},
      label: 'Start',
      row,
    });
    expect(resolved.type).toBeUndefined();
    expect(resolved.filterable).toBe(false);
  });

  it('honours the unfilterable list even when there is a value', () => {
    const resolved = resolve('Status');
    expect(resolved.filterValue).toBe('Completed');
    expect(resolved.filterable).toBe(false);
  });
});
