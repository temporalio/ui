import { describe, expect, it } from 'vitest';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import type { NLSearchFilter } from '$lib/services/nl-search-service';
import type { SearchAttributes } from '$lib/types/workflows';

import { toListWorkflowQueryFromFilters } from './filter-workflow-query';
import { toFiltersFromNLSearch } from './nl-search-filters';
import { toListWorkflowFilters } from './to-list-workflow-filters';

const attributes: SearchAttributes = {
  ExecutionStatus: 'Keyword',
  WorkflowType: 'Keyword',
  WorkflowId: 'Keyword',
  StartTime: 'Datetime',
  CloseTime: 'Datetime',
  HistoryLength: 'Int',
  CustomerTier: 'Keyword',
  IsVip: 'Bool',
};

const nlFilter = (overrides: Partial<NLSearchFilter>): NLSearchFilter => ({
  attribute: 'WorkflowType',
  type: 'Keyword',
  conditional: '=',
  value: 'OrderWorkflow',
  confidence: 0.9,
  ...overrides,
});

const status = (value: string, conditional: '=' | '!=' = '=') =>
  nlFilter({ attribute: 'ExecutionStatus', value, conditional });

const withoutIds = (filters: SearchAttributeFilter[]) =>
  filters.map(({ id: _id, customDate, ...rest }) => ({
    ...rest,
    customDate: customDate ?? false,
  }));

const expectRoundTrip = (filters: SearchAttributeFilter[]) => {
  const query = toListWorkflowQueryFromFilters(filters);
  expect(withoutIds(toListWorkflowFilters(query, attributes))).toEqual(
    withoutIds(filters),
  );
};

describe('toFiltersFromNLSearch', () => {
  it('returns no filters for an empty response', () => {
    expect(toFiltersFromNLSearch([], attributes)).toEqual([]);
    expect(toFiltersFromNLSearch(undefined, attributes)).toEqual([]);
  });

  it('creates a single status filter without parentheses', () => {
    const filters = toFiltersFromNLSearch([status('Failed')], attributes);

    expect(withoutIds(filters)).toEqual([
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        value: 'Failed',
        operator: '',
        parenthesis: '',
        customDate: false,
      },
    ]);
    expect(toListWorkflowQueryFromFilters(filters)).toBe(
      '`ExecutionStatus`="Failed"',
    );
  });

  it('groups several status filters into one OR group placed first', () => {
    const filters = toFiltersFromNLSearch(
      [
        status('Failed'),
        nlFilter({}),
        status('TimedOut'),
        status('Terminated'),
        status('Failed'),
      ],
      attributes,
    );

    expect(
      filters.map(({ attribute, value, operator, parenthesis }) => ({
        attribute,
        value,
        operator,
        parenthesis,
      })),
    ).toEqual([
      {
        attribute: 'ExecutionStatus',
        value: 'Failed',
        operator: 'OR',
        parenthesis: '(',
      },
      {
        attribute: 'ExecutionStatus',
        value: 'TimedOut',
        operator: 'OR',
        parenthesis: '',
      },
      {
        attribute: 'ExecutionStatus',
        value: 'Terminated',
        operator: 'AND',
        parenthesis: ')',
      },
      {
        attribute: 'WorkflowType',
        value: 'OrderWorkflow',
        operator: '',
        parenthesis: '',
      },
    ]);
    expect(toListWorkflowQueryFromFilters(filters)).toBe(
      '(`ExecutionStatus`="Failed" OR `ExecutionStatus`="TimedOut" OR `ExecutionStatus`="Terminated") AND `WorkflowType`="OrderWorkflow"',
    );
    expectRoundTrip(filters);
  });

  it('drops a status value that is not a workflow status', () => {
    expect(toFiltersFromNLSearch([status('Exploded')], attributes)).toEqual([]);
  });

  it('converts a two-sided time range into an editable BETWEEN filter', () => {
    const filters = toFiltersFromNLSearch(
      [
        nlFilter({
          attribute: 'StartTime',
          type: 'Datetime',
          conditional: '>=',
          value: '2026-09-19T04:00:00Z',
        }),
        nlFilter({
          attribute: 'StartTime',
          type: 'Datetime',
          conditional: '<',
          value: '2026-09-20T04:00:00Z',
        }),
      ],
      attributes,
    );

    expect(withoutIds(filters)).toEqual([
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: 'BETWEEN',
        value:
          'BETWEEN "2026-09-19T04:00:00.000Z" AND "2026-09-20T03:59:59.999Z"',
        operator: '',
        parenthesis: '',
        customDate: true,
      },
    ]);
    expect(toListWorkflowQueryFromFilters(filters)).toBe(
      'StartTime BETWEEN "2026-09-19T04:00:00.000Z" AND "2026-09-20T03:59:59.999Z"',
    );
    expectRoundTrip(filters);
  });

  it('keeps inclusive bounds unchanged in a time range', () => {
    const [filter] = toFiltersFromNLSearch(
      [
        nlFilter({
          attribute: 'CloseTime',
          type: 'Datetime',
          conditional: '>',
          value: '2026-09-19T04:00:00Z',
        }),
        nlFilter({
          attribute: 'CloseTime',
          type: 'Datetime',
          conditional: '<=',
          value: '2026-09-20T04:00:00Z',
        }),
      ],
      attributes,
    );

    expect(filter.value).toBe(
      'BETWEEN "2026-09-19T04:00:00.001Z" AND "2026-09-20T04:00:00.000Z"',
    );
  });

  it('keeps a one-sided time filter as a single comparison', () => {
    const filters = toFiltersFromNLSearch(
      [
        nlFilter({
          attribute: 'StartTime',
          type: 'Datetime',
          conditional: '>=',
          value: '2026-09-19T04:00:00Z',
        }),
      ],
      attributes,
    );

    expect(withoutIds(filters)).toEqual([
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>=',
        value: '2026-09-19T04:00:00.000Z',
        operator: '',
        parenthesis: '',
        customDate: false,
      },
    ]);
    expectRoundTrip(filters);
  });

  it('keeps separate ranges for separate Datetime attributes', () => {
    const filters = toFiltersFromNLSearch(
      [
        nlFilter({
          attribute: 'StartTime',
          type: 'Datetime',
          conditional: '>=',
          value: '2026-09-19T04:00:00Z',
        }),
        nlFilter({
          attribute: 'CloseTime',
          type: 'Datetime',
          conditional: '<',
          value: '2026-09-20T04:00:00Z',
        }),
      ],
      attributes,
    );

    expect(filters.map((f) => [f.attribute, f.conditional])).toEqual([
      ['StartTime', '>='],
      ['CloseTime', '<'],
    ]);
    expectRoundTrip(filters);
  });

  it('drops a Datetime filter with an invalid value', () => {
    expect(
      toFiltersFromNLSearch(
        [
          nlFilter({
            attribute: 'StartTime',
            type: 'Datetime',
            conditional: '>=',
            value: 'yesterday',
          }),
        ],
        attributes,
      ),
    ).toEqual([]);
  });

  it('supports STARTS_WITH on a Keyword attribute', () => {
    const filters = toFiltersFromNLSearch(
      [
        nlFilter({
          attribute: 'WorkflowId',
          conditional: 'STARTS_WITH',
          value: 'order-',
        }),
      ],
      attributes,
    );

    expect(toListWorkflowQueryFromFilters(filters)).toBe(
      '`WorkflowId` STARTS_WITH "order-"',
    );
    expectRoundTrip(filters);
  });

  it('drops STARTS_WITH when prefix search is not enabled', () => {
    const startsWith = nlFilter({
      attribute: 'WorkflowId',
      conditional: 'STARTS_WITH',
      value: 'order-',
    });

    const enabled = toFiltersFromNLSearch(
      [startsWith, nlFilter({})],
      attributes,
      { prefixSearchEnabled: true },
    );
    const disabled = toFiltersFromNLSearch(
      [startsWith, nlFilter({})],
      attributes,
      { prefixSearchEnabled: false },
    );

    expect(enabled.map((f) => f.conditional)).toEqual(['STARTS_WITH', '=']);
    expect(disabled.map((f) => [f.attribute, f.conditional])).toEqual([
      ['WorkflowType', '='],
    ]);
    expectRoundTrip(disabled);
  });

  it('drops STARTS_WITH on an attribute that is not a Keyword', () => {
    expect(
      toFiltersFromNLSearch(
        [
          nlFilter({
            attribute: 'HistoryLength',
            type: 'Int',
            conditional: 'STARTS_WITH',
            value: '1',
          }),
        ],
        attributes,
      ),
    ).toEqual([]);
  });

  it('supports a Bool custom attribute', () => {
    const filters = toFiltersFromNLSearch(
      [nlFilter({ attribute: 'IsVip', type: 'Bool', value: 'True' })],
      attributes,
    );

    expect(withoutIds(filters)).toEqual([
      {
        attribute: 'IsVip',
        type: 'Bool',
        conditional: '=',
        value: 'true',
        operator: '',
        parenthesis: '',
        customDate: false,
      },
    ]);
    expect(toListWorkflowQueryFromFilters(filters)).toBe('`IsVip`=true');
    expectRoundTrip(filters);
  });

  it('rewrites a negative Bool filter as a positive filter', () => {
    const [filter] = toFiltersFromNLSearch(
      [
        nlFilter({
          attribute: 'IsVip',
          type: 'Bool',
          conditional: '!=',
          value: 'true',
        }),
      ],
      attributes,
    );

    expect(filter.conditional).toBe('=');
    expect(filter.value).toBe('false');
  });

  it('supports an Int comparison', () => {
    const filters = toFiltersFromNLSearch(
      [
        nlFilter({
          attribute: 'HistoryLength',
          type: 'Int',
          conditional: '>',
          value: '1000',
        }),
      ],
      attributes,
    );

    expect(toListWorkflowQueryFromFilters(filters)).toBe(
      '`HistoryLength`>1000',
    );
    expectRoundTrip(filters);
  });

  it('uses the attribute type from the search attributes', () => {
    const [filter] = toFiltersFromNLSearch(
      [nlFilter({ attribute: 'IsVip', type: 'Keyword', value: 'false' })],
      attributes,
    );

    expect(filter.type).toBe('Bool');
  });

  it('drops a filter with an unknown attribute', () => {
    const filters = toFiltersFromNLSearch(
      [nlFilter({ attribute: 'NotAnAttribute', value: 'x' }), nlFilter({})],
      attributes,
    );

    expect(filters).toHaveLength(1);
    expect(filters[0].attribute).toBe('WorkflowType');
    expect(filters[0].operator).toBe('');
  });

  it('drops a filter with an unsupported conditional or an unsafe value', () => {
    expect(
      toFiltersFromNLSearch(
        [
          nlFilter({ conditional: 'IN' as NLSearchFilter['conditional'] }),
          nlFilter({ conditional: '>' }),
          nlFilter({ value: 'Order" OR WorkflowId="x' }),
          nlFilter({ value: '' }),
        ],
        attributes,
      ),
    ).toEqual([]);
  });

  it('round-trips the full contract example', () => {
    const filters = toFiltersFromNLSearch(
      [
        status('Failed'),
        status('TimedOut'),
        nlFilter({}),
        nlFilter({ attribute: 'CustomerTier', value: 'gold tier' }),
        nlFilter({ attribute: 'IsVip', type: 'Bool', value: 'true' }),
        nlFilter({
          attribute: 'StartTime',
          type: 'Datetime',
          conditional: '>=',
          value: '2026-09-19T04:00:00Z',
        }),
        nlFilter({
          attribute: 'StartTime',
          type: 'Datetime',
          conditional: '<',
          value: '2026-09-20T04:00:00Z',
        }),
      ],
      attributes,
    );

    expect(toListWorkflowQueryFromFilters(filters)).toBe(
      '(`ExecutionStatus`="Failed" OR `ExecutionStatus`="TimedOut") AND `WorkflowType`="OrderWorkflow" AND `CustomerTier`="gold tier" AND `IsVip`=true AND StartTime BETWEEN "2026-09-19T04:00:00.000Z" AND "2026-09-20T03:59:59.999Z"',
    );
    expectRoundTrip(filters);
  });
});
