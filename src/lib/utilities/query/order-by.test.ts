import { describe, expect, it } from 'vitest';

import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

import {
  isOrderByUnsupportedError,
  toQueryWithOrderBy,
  toSortAttribute,
  toWorkflowSort,
} from './order-by';

const searchAttributes = {
  ExecutionStatus: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  StartTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
  CloseTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
  ExecutionDuration: SEARCH_ATTRIBUTE_TYPE.INT,
  TemporalChangeVersion: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
  CustomTextField: SEARCH_ATTRIBUTE_TYPE.TEXT,
  CustomIntField: SEARCH_ATTRIBUTE_TYPE.INT,
  'Custom Spaced Field': SEARCH_ATTRIBUTE_TYPE.KEYWORD,
};

describe('toSortAttribute', () => {
  it('should map a column label to its search attribute', () => {
    expect(toSortAttribute('Start', searchAttributes)).toBe('StartTime');
    expect(toSortAttribute('End', searchAttributes)).toBe('CloseTime');
    expect(toSortAttribute('Status', searchAttributes)).toBe('ExecutionStatus');
  });

  it('should pass through custom search attribute labels', () => {
    expect(toSortAttribute('CustomIntField', searchAttributes)).toBe(
      'CustomIntField',
    );
  });

  it('should not sort by attributes missing from the namespace', () => {
    expect(
      toSortAttribute('Parent Namespace', searchAttributes),
    ).toBeUndefined();
    expect(toSortAttribute('History Size', searchAttributes)).toBeUndefined();
  });

  it('should not sort by Text or KeywordList attributes', () => {
    expect(
      toSortAttribute('CustomTextField', searchAttributes),
    ).toBeUndefined();
    expect(toSortAttribute('Change Version', searchAttributes)).toBeUndefined();
  });
});

describe('toWorkflowSort', () => {
  it('should return undefined without a sort parameter', () => {
    expect(toWorkflowSort(new URLSearchParams(''))).toBeUndefined();
    expect(
      toWorkflowSort(new URLSearchParams('sort-order=asc')),
    ).toBeUndefined();
  });

  it('should default to descending', () => {
    expect(toWorkflowSort(new URLSearchParams('sort=StartTime'))).toEqual({
      attribute: 'StartTime',
      order: 'desc',
    });
    expect(
      toWorkflowSort(new URLSearchParams('sort=StartTime&sort-order=nonsense')),
    ).toEqual({ attribute: 'StartTime', order: 'desc' });
  });

  it('should parse an ascending sort', () => {
    expect(
      toWorkflowSort(new URLSearchParams('sort=StartTime&sort-order=asc')),
    ).toEqual({ attribute: 'StartTime', order: 'asc' });
  });
});

describe('toQueryWithOrderBy', () => {
  it('should return the query unchanged without a sort', () => {
    expect(toQueryWithOrderBy('ExecutionStatus="Running"')).toBe(
      'ExecutionStatus="Running"',
    );
    expect(toQueryWithOrderBy('')).toBe('');
  });

  it('should append an order by clause to a query', () => {
    expect(
      toQueryWithOrderBy('ExecutionStatus="Running"', {
        attribute: 'StartTime',
        order: 'asc',
      }),
    ).toBe('ExecutionStatus="Running" order by StartTime asc');
  });

  it('should build an order by only query', () => {
    expect(
      toQueryWithOrderBy('', { attribute: 'CloseTime', order: 'desc' }),
    ).toBe('order by CloseTime desc');
  });

  it('should escape attributes containing spaces', () => {
    expect(
      toQueryWithOrderBy('', {
        attribute: 'Custom Spaced Field',
        order: 'asc',
      }),
    ).toBe('order by `Custom Spaced Field` asc');
  });
});

describe('isOrderByUnsupportedError', () => {
  it('should detect the SQL visibility store rejection', () => {
    expect(isOrderByUnsupportedError("not supported: 'ORDER BY' clause")).toBe(
      true,
    );
  });

  it('should detect the disabled order by dynamic config rejection', () => {
    expect(isOrderByUnsupportedError('ORDER BY clause is not supported')).toBe(
      true,
    );
  });

  it('should detect an unsortable search attribute type', () => {
    expect(
      isOrderByUnsupportedError(
        'not supported: unable to sort by search attribute type Text',
      ),
    ).toBe(true);
  });

  it('should ignore unrelated errors', () => {
    expect(isOrderByUnsupportedError('invalid query syntax')).toBe(false);
    expect(isOrderByUnsupportedError('')).toBe(false);
    expect(isOrderByUnsupportedError(undefined)).toBe(false);
  });
});
