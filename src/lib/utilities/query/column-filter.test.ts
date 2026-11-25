import { describe, expect, it } from 'vitest';

import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

import {
  isAppliedFilter,
  isAtQueryLimit,
  isReadOnlyFilter,
  replaceAttributeFilters,
  targetsStatusAttribute,
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

  it('is false for a value the query leaves out', () => {
    expect(
      isAppliedFilter(
        createFilter({
          attribute: 'WorkflowId',
          conditional: '=',
          value: 'undefined',
        }),
      ),
    ).toBe(false);
  });

  it('is false for a filter that was added but never given a value', () => {
    expect(
      isAppliedFilter(
        createFilter({ attribute: 'WorkflowId', conditional: '=' }),
      ),
    ).toBe(false);
  });
});

describe('isReadOnlyFilter', () => {
  it.each([
    ['a filter on a text attribute', { attribute: 'WorkflowId' }],
    ['a status filter', { attribute: 'ExecutionStatus' }],
    ['a != status filter', { attribute: 'ExecutionStatus', conditional: '!=' }],
    [
      'an IN filter on a list attribute',
      {
        attribute: 'CustomKeywordListField',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
        conditional: 'in',
      },
    ],
    [
      'a NOT IN filter on a list attribute',
      {
        attribute: 'CustomKeywordListField',
        type: SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST,
        conditional: 'not in',
      },
    ],
  ])('is false for %s', (_, overrides) => {
    expect(
      isReadOnlyFilter(
        createFilter({ conditional: '=', value: 'a', ...overrides }),
      ),
    ).toBe(false);
  });

  it.each([
    ['a negated filter', { attribute: 'WorkflowId', negated: true }],
    [
      'a filter from a query it cannot show',
      { attribute: 'WorkflowId', unsupportedQuery: true },
    ],
    [
      'a NOT IN status filter',
      { attribute: 'ExecutionStatus', conditional: 'NOT IN' },
    ],
    [
      'an IN filter on a keyword attribute',
      { attribute: 'WorkflowType', conditional: 'IN' },
    ],
    [
      'a NOT IN filter on a keyword attribute',
      { attribute: 'WorkflowType', conditional: 'not in' },
    ],
  ])('is true for %s', (_, overrides) => {
    expect(
      isReadOnlyFilter(
        createFilter({ conditional: '=', value: 'a', ...overrides }),
      ),
    ).toBe(true);
  });
});

describe('targetsStatusAttribute', () => {
  it('targets a status filter that includes statuses', () => {
    expect(targetsStatusAttribute(status('Running'), 'ExecutionStatus')).toBe(
      true,
    );
  });

  it.each(['NOT IN', 'not in', '!='])(
    'does not target a status filter with %s',
    (conditional) => {
      const filter = createFilter({
        attribute: 'ExecutionStatus',
        value: 'Running',
        conditional,
      });
      expect(targetsStatusAttribute(filter, 'ExecutionStatus')).toBe(false);
    },
  );

  it.each(['IN', 'in', 'NOT IN'])(
    'does not target a status filter with an %s list',
    (conditional) => {
      const filter = createFilter({
        attribute: 'ExecutionStatus',
        value: '("Running", "Failed")',
        conditional,
      });
      expect(targetsStatusAttribute(filter, 'ExecutionStatus')).toBe(false);
    },
  );

  it('does not target a negated status filter', () => {
    const filter = createFilter({ ...status('Running'), negated: true });
    expect(targetsStatusAttribute(filter, 'ExecutionStatus')).toBe(false);
  });

  it('does not target a status filter from a query it cannot show', () => {
    const filter = createFilter({
      ...status('Running'),
      unsupportedQuery: true,
    });
    expect(targetsStatusAttribute(filter, 'ExecutionStatus')).toBe(false);
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

  it('keeps filters the given predicate does not target', () => {
    const notIn = createFilter({
      id: 'not-in',
      attribute: 'ExecutionStatus',
      value: '("Terminated", "Canceled")',
      conditional: 'NOT IN',
    });

    expect(
      replaceAttributeFilters(
        [notIn, status('Running'), workflowId],
        'ExecutionStatus',
        [status('Failed')],
        targetsStatusAttribute,
      ).map((f) => f.id),
    ).toEqual(['not-in', 'Failed', 'wid']);
  });

  it('keeps the OR that joined the replaced filters to the next filter', () => {
    const notFailed = createFilter({
      id: 'not-failed',
      attribute: 'ExecutionStatus',
      value: 'Failed',
      conditional: '!=',
    });
    const running = { ...status('Running'), operator: 'OR' };
    const completed = status('Completed');

    const result = replaceAttributeFilters(
      [running, notFailed],
      'ExecutionStatus',
      [{ ...status('Running'), operator: 'OR' }, completed],
      targetsStatusAttribute,
    );

    expect(result.map((f) => [f.id, f.operator])).toEqual([
      ['Running', 'OR'],
      ['Completed', 'OR'],
      ['not-failed', ''],
    ]);
    expect(completed.operator).toBe('');
  });

  it('leaves the filters unchanged when the query has an unsupported NOT', () => {
    const filters = [
      { ...workflowId, unsupportedQuery: true },
      { ...status('Running'), unsupportedQuery: true },
    ];

    expect(
      replaceAttributeFilters(filters, 'WorkflowType', [workflowType]),
    ).toBe(filters);
  });

  it('keeps negated filters for the attribute', () => {
    const notTerminated = createFilter({
      id: 'not-terminated',
      attribute: 'ExecutionStatus',
      value: 'Terminated',
      conditional: '=',
      negated: true,
    });

    expect(
      replaceAttributeFilters(
        [notTerminated, status('Running'), workflowId],
        'ExecutionStatus',
        [status('Failed')],
      ).map((f) => f.id),
    ).toEqual(['not-terminated', 'Failed', 'wid']);
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
