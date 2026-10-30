import { describe, expect, it } from 'vitest';

import {
  isAppliedFilter,
  isAtQueryLimit,
  removeFilterById,
  replaceAttributeFilters,
  upsertFilter,
} from './column-filter';
import { MAX_QUERY_LENGTH } from '../request-from-api';
import { createFilter } from './to-list-workflow-filters';

const status = (value: string, id = value) =>
  createFilter({ id, attribute: 'ExecutionStatus', value, conditional: '=' });
const workflowId = createFilter({
  id: 'wid',
  attribute: 'WorkflowId',
  value: 'abc',
  conditional: '=',
});
const workflowType = createFilter({
  id: 'wtype',
  attribute: 'WorkflowType',
  value: 'hello',
  conditional: '=',
});

describe('isAppliedFilter', () => {
  it('is true when the filter has a value', () => {
    expect(isAppliedFilter(workflowId)).toBe(true);
  });

  it('is true for a null check, which has no value', () => {
    expect(
      isAppliedFilter(
        createFilter({ attribute: 'WorkflowId', conditional: 'is' }),
      ),
    ).toBe(true);
  });

  it('is false for an in filter with an empty list', () => {
    expect(
      isAppliedFilter(
        createFilter({
          attribute: 'CustomKeywordList',
          type: 'KeywordList',
          conditional: 'in',
          value: '()',
        }),
      ),
    ).toBe(false);
  });

  it('is true for an in filter with values', () => {
    expect(
      isAppliedFilter(
        createFilter({
          attribute: 'CustomKeywordList',
          type: 'KeywordList',
          conditional: 'in',
          value: '("a")',
        }),
      ),
    ).toBe(true);
  });

  it('is false for a filter that was added but never given a value', () => {
    expect(
      isAppliedFilter(
        createFilter({ attribute: 'WorkflowId', conditional: '=' }),
      ),
    ).toBe(false);
  });
});

describe('replaceAttributeFilters', () => {
  it('replaces every filter for the attribute in place of the first one', () => {
    const filters = [
      workflowId,
      status('Running'),
      status('Failed'),
      workflowType,
    ];

    expect(
      replaceAttributeFilters(filters, 'ExecutionStatus', [
        status('Completed'),
      ]).map((f) => f.id),
    ).toEqual(['wid', 'Completed', 'wtype']);
  });

  it('appends when nothing targets the attribute yet', () => {
    expect(
      replaceAttributeFilters([workflowId], 'ExecutionStatus', [
        status('Running'),
      ]).map((f) => f.id),
    ).toEqual(['wid', 'Running']);
  });

  it('removes the attribute when given no replacements', () => {
    expect(
      replaceAttributeFilters(
        [status('Running'), workflowId],
        'ExecutionStatus',
        [],
      ).map((f) => f.id),
    ).toEqual(['wid']);
  });
});

describe('upsertFilter', () => {
  it('replaces the filter with the same id where it stands', () => {
    const updated = { ...workflowId, value: 'xyz' };

    expect(upsertFilter([workflowId, workflowType], updated)).toEqual([
      updated,
      workflowType,
    ]);
  });

  it('appends a filter it has not seen', () => {
    expect(upsertFilter([workflowId], workflowType)).toEqual([
      workflowId,
      workflowType,
    ]);
  });
});

describe('removeFilterById', () => {
  it('removes only the filter with that id', () => {
    expect(removeFilterById([workflowId, workflowType], 'wid')).toEqual([
      workflowType,
    ]);
  });
});

describe('isAtQueryLimit', () => {
  const urlWithQuery = (length: number) => {
    const url = new URL('http://localhost/workflows');
    url.searchParams.set('query', 'a'.repeat(length));
    return url;
  };

  it('is false without a query', () => {
    expect(isAtQueryLimit(new URL('http://localhost/workflows'))).toBe(false);
  });

  it('is false below the limit', () => {
    expect(isAtQueryLimit(urlWithQuery(MAX_QUERY_LENGTH - 1))).toBe(false);
  });

  it('is true at the limit', () => {
    expect(isAtQueryLimit(urlWithQuery(MAX_QUERY_LENGTH))).toBe(true);
  });
});
