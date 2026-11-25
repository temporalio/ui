import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toListWorkflowQueryFromFilters } from './filter-workflow-query';
import {
  combineFilters,
  toListWorkflowFilters,
} from './to-list-workflow-filters';
import { isVersionNewer } from '../version-check';

describe('toListWorkflowQueryFromFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01').getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return an empty string for empty filters', () => {
    const query = toListWorkflowQueryFromFilters([]);
    expect(query).toBe('');
  });

  it('should ignore empty value filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: '',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('');
  });

  it('should convert an ExecutionStatus filter', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Running',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`ExecutionStatus`="Running"');
  });

  it('should convert multiple ExecutionStatus filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Running',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: ')',
        value: 'Failed',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe(
      '(`ExecutionStatus`="Running" OR `ExecutionStatus`="Canceled" OR `ExecutionStatus`="Failed")',
    );
  });

  it('should convert a boolean filter', () => {
    const filters = [
      {
        attribute: 'CustomBoolField',
        type: 'Bool',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'false',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`CustomBoolField`=false');
  });

  it('should convert two different filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'abcd',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe('`ExecutionStatus`="Running" AND `WorkflowId`="abcd"');
  });

  it('should convert three different filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'abcd',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'cronWorkflow',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe(
      '`ExecutionStatus`="Running" AND `WorkflowId`="abcd" AND `WorkflowType`="cronWorkflow"',
    );
  });

  it('should convert datetime filter', () => {
    const filters = [
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ];

    const supportsAdvancedVisibility = isVersionNewer('1.20', '1.19');
    const query = toListWorkflowQueryFromFilters(
      filters,
      supportsAdvancedVisibility,
    );
    expect(query).toBe('StartTime > "2019-12-30T00:00:00.000Z"');
  });

  it('should convert two filters, one as datetime filter', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'cronWorkflow',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ];
    const supportsAdvancedVisibility = isVersionNewer('1.20', '1.19');
    const query = toListWorkflowQueryFromFilters(
      combineFilters(filters),
      supportsAdvancedVisibility,
    );
    expect(query).toBe(
      '`WorkflowType`="cronWorkflow" AND StartTime > "2019-12-30T00:00:00.000Z"',
    );
  });

  it.each([
    ['null', null],
    ['empty string', ''],
    ['undefined', undefined],
  ])(
    'should convert a Keyword filter with is null conditional when value is %s',
    (_, value) => {
      const filters = [
        {
          attribute: 'CustomKeywordField',
          type: 'Keyword',
          conditional: 'is',
          operator: '',
          parenthesis: '',
          value,
        },
        {
          attribute: 'CustomKeywordField',
          type: 'Keyword',
          conditional: 'is not',
          operator: '',
          parenthesis: '',
          value,
        },
      ];
      const query = toListWorkflowQueryFromFilters(combineFilters(filters));
      expect(query).toBe(
        '`CustomKeywordField` is null AND `CustomKeywordField` is not null',
      );
    },
  );

  it('should convert an Int filter without quoting the value', () => {
    const filters = [
      {
        attribute: 'CustomIntField',
        type: 'Int',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: '1',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`CustomIntField`=1');
  });

  it('should convert a Double filter without quoting the value', () => {
    const filters = [
      {
        attribute: 'CustomDoubleField',
        type: 'Double',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '1.5',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`CustomDoubleField`>1.5');
  });

  it('should convert numeric filters alongside keyword filters', () => {
    const filters = [
      {
        attribute: 'CustomIntField',
        type: 'Int',
        conditional: '>=',
        operator: '',
        parenthesis: '',
        value: '10',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'abcd',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe('`CustomIntField`>=10 AND `WorkflowId`="abcd"');
  });

  it('should convert an Int filter with is null conditional', () => {
    const filters = [
      {
        attribute: 'CustomIntField',
        type: 'Int',
        conditional: 'is',
        operator: '',
        parenthesis: '',
        value: null,
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`CustomIntField` is null');
  });

  it('should quote ExecutionDuration Go duration strings', () => {
    const filters = [
      {
        attribute: 'ExecutionDuration',
        type: 'Int',
        conditional: '>=',
        operator: '',
        parenthesis: '',
        value: '30s',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`ExecutionDuration`>="30s"');
  });

  it('should not quote ExecutionDuration nanosecond integers', () => {
    const filters = [
      {
        attribute: 'ExecutionDuration',
        type: 'Int',
        conditional: '>=',
        operator: '',
        parenthesis: '',
        value: '30000000000',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`ExecutionDuration`>=30000000000');
  });

  it('should convert a KeywordList filter', () => {
    const filters = [
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'in',
        operator: '',
        parenthesis: '',
        value: '("Hello", "World")',
      },
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'is',
        operator: '',
        parenthesis: '',
        value: null,
      },
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe(
      '`CustomKeywordListField`in("Hello", "World") AND `CustomKeywordListField` is null AND `CustomKeywordListField`="Hello"',
    );
  });

  it('should convert a KeywordList filter with a not in conditional', () => {
    const filters = [
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'not in',
        operator: '',
        parenthesis: '',
        value: '("Hello", "World")',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`CustomKeywordListField`not in("Hello", "World")');
  });

  it('should combine a not in KeywordList filter with another filter', () => {
    const filters = [
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'not in',
        operator: '',
        parenthesis: '',
        value: '("Hello", "World")',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'ExampleWorkflow',
      },
    ];
    const query = toListWorkflowQueryFromFilters(combineFilters(filters));
    expect(query).toBe(
      '`CustomKeywordListField`not in("Hello", "World") AND `WorkflowType`="ExampleWorkflow"',
    );
  });

  it('should convert a negated STARTS_WITH filter with an infix NOT', () => {
    const filters = [
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: 'STARTS_WITH',
        operator: '',
        parenthesis: '',
        value: 'abc',
        negated: true,
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`WorkflowId` NOT STARTS_WITH "abc"');
  });

  it('should convert a negated filter with a prefix NOT', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
        negated: true,
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('NOT `WorkflowType`="World"');
  });

  it.each([
    [
      '`WorkflowType`="Deploy" AND `WorkflowId` NOT STARTS_WITH "first_" AND `WorkflowId` NOT STARTS_WITH "second_"',
      '`WorkflowType`="Deploy" AND `WorkflowId` NOT STARTS_WITH "first_" AND `WorkflowId` NOT STARTS_WITH "second_"',
    ],
    [
      '`WorkflowId`="temporal.canary.cron" AND NOT `ExecutionStatus` IN ("Terminated", "Canceled")',
      '`WorkflowId`="temporal.canary.cron" AND NOT `ExecutionStatus`IN("Terminated", "Canceled")',
    ],
    [
      'NOT `WorkflowType`="World" AND `WorkflowId`="abc"',
      'NOT `WorkflowType`="World" AND `WorkflowId`="abc"',
    ],
    [
      '`WorkflowId`="temporal.canary.cron" AND `ExecutionStatus` NOT IN ("Terminated", "Canceled")',
      '`WorkflowId`="temporal.canary.cron" AND `ExecutionStatus`NOT IN("Terminated", "Canceled")',
    ],
  ])(
    'should keep NOT when rebuilding %s from its filters',
    (query, expected) => {
      const filters = combineFilters(toListWorkflowFilters(query));
      expect(toListWorkflowQueryFromFilters(filters)).toBe(expected);
    },
  );

  it('should not quote an IN list for a Keyword attribute', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: 'IN',
        operator: '',
        parenthesis: '',
        value: '("Terminated", "Canceled")',
      },
    ];
    const query = toListWorkflowQueryFromFilters(filters);
    expect(query).toBe('`ExecutionStatus`IN("Terminated", "Canceled")');
  });

  it.each([
    [{ conditional: '=', value: 'a' }, '`Custom Space`="a"'],
    [{ conditional: '=', value: 'a', negated: true }, 'NOT `Custom Space`="a"'],
    [
      { conditional: 'STARTS_WITH', value: 'a', negated: true },
      '`Custom Space` NOT STARTS_WITH "a"',
    ],
    [{ conditional: 'IS', value: null }, '`Custom Space` IS null'],
  ])(
    'should wrap an attribute with spaces in one pair of backticks',
    (overrides, expected) => {
      const filters = [
        {
          attribute: 'Custom Space',
          type: 'Keyword',
          operator: '',
          parenthesis: '',
          ...overrides,
        },
      ];
      expect(toListWorkflowQueryFromFilters(filters)).toBe(expected);
    },
  );
});
