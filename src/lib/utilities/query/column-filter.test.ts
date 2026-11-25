import { describe, expect, it } from 'vitest';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

import {
  canAddValue,
  excludesValue,
  hasMixedOrGroup,
  isAppliedFilter,
  isAtQueryLimit,
  isReadOnlyFilter,
  parseListValues,
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

  it('targets a status filter with ==', () => {
    const filter = createFilter({ ...status('Running'), conditional: '==' });
    expect(targetsStatusAttribute(filter, 'ExecutionStatus')).toBe(true);
  });

  it.each(['!==', 'STARTS_WITH', 'is null', '>'])(
    'does not target a status filter with %s',
    (conditional) => {
      const filter = createFilter({ ...status('Running'), conditional });
      expect(targetsStatusAttribute(filter, 'ExecutionStatus')).toBe(false);
    },
  );
});

describe('parseListValues', () => {
  it.each([
    ['("a", "b")', ['a', 'b']],
    ["('a','b')", ['a', 'b']],
    ['(1, 2)', ['1', '2']],
    ['("a,b", "c")', ['a,b', 'c']],
    ['("a b")', ['a b']],
    ['("")', ['']],
    ['()', []],
    [null, []],
  ])('reads %s', (value, expected) => {
    expect(parseListValues(value)).toEqual(expected);
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

  it('drops a filter that excludes a value it now includes', () => {
    const notRunning = createFilter({
      id: 'not-running',
      attribute: 'ExecutionStatus',
      value: 'Running',
      conditional: '!=',
    });

    expect(
      replaceAttributeFilters(
        [notRunning, workflowId],
        'ExecutionStatus',
        [status('Running')],
        targetsStatusAttribute,
      ).map((f) => f.id),
    ).toEqual(['wid', 'Running']);
  });

  it('leaves the filters unchanged when a kept OR group excludes the value', () => {
    const notA = createFilter({
      id: 'not-a',
      attribute: 'WorkflowType',
      value: 'a',
      conditional: '=',
      operator: 'OR',
      negated: true,
    });
    const notInA = createFilter({
      id: 'not-in-a',
      attribute: 'WorkflowType',
      value: '("a")',
      conditional: 'NOT IN',
    });
    const filters = [notA, notInA];
    const a = createFilter({
      id: 'a',
      attribute: 'WorkflowType',
      value: 'a',
      conditional: '=',
    });

    expect(replaceAttributeFilters(filters, 'WorkflowType', [a])).toBe(filters);
  });

  it('replaces an OR group it targets even when the group excludes the value', () => {
    const notA = createFilter({
      id: 'not-a',
      attribute: 'WorkflowType',
      value: 'a',
      conditional: '!=',
      operator: 'OR',
    });
    const b = createFilter({
      id: 'b',
      attribute: 'WorkflowType',
      value: 'b',
      conditional: '=',
    });
    const a = createFilter({
      id: 'a',
      attribute: 'WorkflowType',
      value: 'a',
      conditional: '=',
    });

    expect(
      replaceAttributeFilters([notA, b, workflowId], 'WorkflowType', [a]).map(
        (f) => f.id,
      ),
    ).toEqual(['a', 'wid']);
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

describe('excludesValue', () => {
  const check = (overrides: Partial<SearchAttributeFilter>) =>
    excludesValue(
      createFilter({ attribute: 'ExecutionStatus', ...overrides }),
      'ExecutionStatus',
      'Running',
    );

  it.each([
    ['NOT = the value', { conditional: '=', value: 'Running', negated: true }],
    ['!= the value', { conditional: '!=', value: 'Running' }],
    [
      'NOT IN a list with the value',
      { conditional: 'NOT IN', value: '("Running")' },
    ],
    [
      'NOT … IN a list with the value',
      { conditional: 'IN', value: '("Running")', negated: true },
    ],
    ['IN a list without the value', { conditional: 'IN', value: '("Failed")' }],
    [
      'NOT … NOT IN a list without the value',
      { conditional: 'not in', value: '("Failed")', negated: true },
    ],
    [
      '== the value negated',
      { conditional: '==', value: 'Running', negated: true },
    ],
    ['!== the value', { conditional: '!==', value: 'Running' }],
    [
      'NOT … != another value',
      { conditional: '!=', value: 'Failed', negated: true },
    ],
    [
      'NOT … STARTS_WITH a prefix of the value',
      { conditional: 'STARTS_WITH', value: 'Run', negated: true },
    ],
    [
      'STARTS_WITH another prefix',
      { conditional: 'STARTS_WITH', value: 'Fail' },
    ],
  ])('is true for %s', (_, overrides) => {
    expect(check(overrides)).toBe(true);
  });

  it.each([
    ['= the value', { conditional: '=', value: 'Running' }],
    [
      'NOT = another value',
      { conditional: '=', value: 'Failed', negated: true },
    ],
    [
      'NOT … != the value',
      { conditional: '!=', value: 'Running', negated: true },
    ],
    ['IN a list with the value', { conditional: 'IN', value: '("Running")' }],
    ['== the value', { conditional: '==', value: 'Running' }],
    [
      'IN a list that quotes the value with single quotes',
      { conditional: 'IN', value: "('Failed', 'Running')" },
    ],
    [
      'STARTS_WITH a prefix of the value',
      { conditional: 'STARTS_WITH', value: 'Run' },
    ],
    [
      'NOT … STARTS_WITH another prefix',
      { conditional: 'STARTS_WITH', value: 'Fail', negated: true },
    ],
    [
      'NOT … NOT IN a list with the value',
      { conditional: 'NOT IN', value: '("Running")', negated: true },
    ],
    [
      'a filter from a query it cannot show',
      { conditional: '!=', value: 'Running', unsupportedQuery: true },
    ],
  ])('is false for %s', (_, overrides) => {
    expect(check(overrides)).toBe(false);
  });

  it('is false for a filter on another attribute', () => {
    expect(
      excludesValue(
        createFilter({
          attribute: 'WorkflowType',
          conditional: '!=',
          value: 'Running',
        }),
        'ExecutionStatus',
        'Running',
      ),
    ).toBe(false);
  });

  it('reads unquoted numbers in an IN list', () => {
    const filter = createFilter({
      attribute: 'CustomInt',
      type: SEARCH_ATTRIBUTE_TYPE.INT,
      conditional: 'IN',
      value: '(1, 2)',
    });
    expect(excludesValue(filter, 'CustomInt', '1')).toBe(false);
    expect(excludesValue(filter, 'CustomInt', '3')).toBe(true);
  });

  it('keeps commas inside a quoted IN list value', () => {
    const filter = createFilter({
      attribute: 'WorkflowType',
      conditional: 'IN',
      value: '("a,b", "c")',
    });
    expect(excludesValue(filter, 'WorkflowType', 'a,b')).toBe(false);
    expect(excludesValue(filter, 'WorkflowType', 'a')).toBe(true);
  });
});

describe('canAddValue', () => {
  const statusFilter = (overrides: Partial<SearchAttributeFilter>) =>
    createFilter({
      attribute: 'ExecutionStatus',
      type: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      conditional: '=',
      value: 'Running',
      ...overrides,
    });

  it('is true when nothing excludes the value', () => {
    expect(canAddValue([workflowId], 'ExecutionStatus', 'Running')).toBe(true);
  });

  it('is true when a simple exclusion can be dropped', () => {
    expect(
      canAddValue(
        [statusFilter({ conditional: '!=' }), workflowId],
        'ExecutionStatus',
        'Running',
      ),
    ).toBe(true);
  });

  it('is false when a list excludes the value', () => {
    expect(
      canAddValue(
        [statusFilter({ conditional: 'NOT IN', value: '("Running")' })],
        'ExecutionStatus',
        'Running',
      ),
    ).toBe(false);
  });

  it('is true when another filter in the OR group lets the value through', () => {
    expect(
      canAddValue(
        [
          statusFilter({ negated: true, operator: 'OR' }),
          statusFilter({ value: 'Failed', negated: true }),
        ],
        'ExecutionStatus',
        'Running',
      ),
    ).toBe(true);
  });

  it('is false when the exclusion is in an OR group', () => {
    expect(
      canAddValue(
        [
          statusFilter({ value: 'Failed', operator: 'OR', parenthesis: '(' }),
          statusFilter({ conditional: '!=', parenthesis: ')' }),
        ],
        'ExecutionStatus',
        'Running',
      ),
    ).toBe(false);
  });
});

describe('hasMixedOrGroup', () => {
  const type = (overrides: Partial<SearchAttributeFilter>) =>
    createFilter({
      attribute: 'WorkflowType',
      conditional: '=',
      value: 'a',
      ...overrides,
    });

  it('is false for an OR group the editor can change', () => {
    expect(
      hasMixedOrGroup([type({ operator: 'OR' }), type({ value: 'b' })]),
    ).toBe(false);
  });

  it('is false for a read-only filter joined with AND', () => {
    expect(
      hasMixedOrGroup([
        type({ operator: 'AND' }),
        type({ value: 'b', negated: true }),
      ]),
    ).toBe(false);
  });

  it('is true when a negated filter shares an OR group with editable ones', () => {
    expect(
      hasMixedOrGroup([
        type({ operator: 'OR' }),
        type({ value: 'b', negated: true, operator: 'or' }),
        type({ value: 'c', operator: 'AND' }),
        createFilter({ attribute: 'WorkflowId', conditional: '=', value: '1' }),
      ]),
    ).toBe(true);
  });

  it('is true when a status != shares an OR group with a selected status', () => {
    expect(
      hasMixedOrGroup([
        createFilter({
          attribute: 'ExecutionStatus',
          conditional: '=',
          value: 'Running',
          operator: 'OR',
        }),
        createFilter({
          attribute: 'ExecutionStatus',
          conditional: '!=',
          value: 'Failed',
        }),
      ]),
    ).toBe(true);
  });
});
