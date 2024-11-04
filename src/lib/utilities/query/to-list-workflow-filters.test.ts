import { parseISO } from 'date-fns';
import { afterEach } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import {
  combineDropdownFilters,
  combineFilters,
  toListWorkflowFilters,
} from './to-list-workflow-filters';

const executionStatusQuery = '`ExecutionStatus`="Completed"';
const multipleExecutionStatusQuery =
  '(`ExecutionStatus`="Canceled" OR `ExecutionStatus`="Failed" OR `ExecutionStatus`="Completed")';

const workflowIdQuery = '`WorkflowId`="Hello world"';
const workflowTypeQuery = '`WorkflowType`="World"';
const workflowQuery1 = '`WorkflowId`="Hello world" AND `WorkflowType`="World"';
const startTimeQuery = '`StartTime` > "2022-04-18T17:45:18-06:00"';
const closeTimeQuery = '`CloseTime` > "2022-04-18T17:45:18-06:00"';
const booleanQuery = '`CustomBoolField`=true';
const betweenTimeQuery =
  '`StartTime` BETWEEN "2023-07-28T00:00:00-00:00" AND "2023-07-28T06:00:00-00:00"';
const workflowQuery2 =
  '`WorkflowType`="World" AND `StartTime` > "2022-04-18T17:45:18-06:00"';
const workflowQuery3 =
  '`WorkflowType`="World" AND `StartTime` > "2022-04-18T17:45:18-06:00" AND `ExecutionStatus`="Canceled"';
const workflowQuery4 =
  '(`ExecutionStatus`="Canceled" OR `ExecutionStatus`="Failed" OR `ExecutionStatus`="Completed") AND WorkflowType="World" AND StartTime > "2022-04-18T17:45:18-06:00"';
const customAttributesWithSpacesQuery =
  '`Custom Bool Field`=true AND `Custom Keyword Field`="Hello world"';
const workflowQueryWithSpaces =
  '`WorkflowId`="One and Two" AND `Custom Keyword Field`="Hello = world"';
const prefixQuery = '`WorkflowType` STARTS_WITH "hello"';
const isEmptyQuery = '`WorkflowType` is null';
const isNotEmptyQuery = '`StartTime` IS NOT NULL';
const keywordListQuery = '`CustomKeywordListField`IN("Hello", "World")';

const attributes = {
  CloseTime: 'Datetime',
  ExecutionStatus: 'Keyword',
  StartTime: 'Datetime',
  WorkflowId: 'Keyword',
  WorkflowType: 'Keyword',
  CustomBoolField: 'Bool',
  'Custom Keyword Field': 'Keyword',
  'Custom Bool Field': 'Bool',
  CustomKeywordListField: 'KeywordList',
};

describe('toListWorkflowFilters', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should parse a query with values that have spaces', () => {
    const result = toListWorkflowFilters(workflowQueryWithSpaces, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'One and Two',
      },
      {
        attribute: 'Custom Keyword Field',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello = world',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with prefix search', () => {
    const result = toListWorkflowFilters(prefixQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: 'STARTS_WITH',
        operator: '',
        parenthesis: '',
        value: 'hello',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with custom attributes that have spaces', () => {
    const result = toListWorkflowFilters(
      customAttributesWithSpacesQuery,
      attributes,
    );
    const expectedFilters = [
      {
        attribute: 'Custom Bool Field',
        type: 'Bool',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'true',
      },
      {
        attribute: 'Custom Keyword Field',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello world',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with an executionStatus', () => {
    const result = toListWorkflowFilters(executionStatusQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Completed',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with multiple executionStatuses', () => {
    const result = toListWorkflowFilters(
      multipleExecutionStatusQuery,
      attributes,
    );
    const expectedFilters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Failed',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: ')',
        value: 'Completed',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a workflowId', () => {
    const result = toListWorkflowFilters(workflowIdQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello world',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a workflowType', () => {
    const result = toListWorkflowFilters(workflowTypeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a workflowId and workflowType', () => {
    const result = toListWorkflowFilters(workflowQuery1, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello world',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a startTime', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(startTimeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2022-04-18T17:45:18-06:00',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a closeTime', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(closeTimeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'CloseTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2022-04-18T17:45:18-06:00',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a Bool type', () => {
    const result = toListWorkflowFilters(booleanQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'CustomBoolField',
        type: 'Bool',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'true',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a KeywordList type', () => {
    const result = toListWorkflowFilters(keywordListQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'IN',
        operator: '',
        parenthesis: '',
        value: '("Hello", "World")',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a KeywordList type and other types ', () => {
    const result = toListWorkflowFilters(
      keywordListQuery + ' AND ' + workflowQuery4 + ' AND ' + keywordListQuery,
      attributes,
    );
    const expectedFilters = [
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'IN',
        operator: 'AND',
        parenthesis: '',
        value: '("Hello", "World")',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Failed',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: ')',
        value: 'Completed',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: 'AND',
        parenthesis: '',
        value: '2022-04-18T17:45:18-06:00',
      },
      {
        attribute: 'CustomKeywordListField',
        type: 'KeywordList',
        conditional: 'IN',
        operator: '',
        parenthesis: '',
        value: '("Hello", "World")',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query BETWEEN two times', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(betweenTimeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '',
        operator: '',
        parenthesis: '',
        value:
          'BETWEEN "2023-07-28T00:00:00-00:00" AND "2023-07-28T06:00:00-00:00"',
        customDate: true,
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a workflowType and startTime', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(workflowQuery2, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2022-04-18T17:45:18-06:00',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a workflowId and BETWEEN two times', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(
      `${workflowIdQuery} AND ${betweenTimeQuery}`,
      attributes,
    );
    const expectedFilters = [
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello world',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '',
        operator: '',
        parenthesis: '',
        value:
          'BETWEEN "2023-07-28T00:00:00-00:00" AND "2023-07-28T06:00:00-00:00"',
        customDate: true,
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with a workflowType and startTime and execution status', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(workflowQuery3, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: 'AND',
        parenthesis: '',
        value: '2022-04-18T17:45:18-06:00',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Canceled',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with multiple executionStatuses and workflowType and startTime', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );

    const result = toListWorkflowFilters(workflowQuery4, attributes);
    const expectedFilters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Failed',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: ')',
        value: 'Completed',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2022-04-18T17:45:18-06:00',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should not throw if given an invalid start time', () => {
    expect(() => {
      toListWorkflowFilters('StartTime = "bogus"', attributes);
    }).not.toThrow();
  });

  it('should console error if given an invalid start time', () => {
    const spy = vi.spyOn(console, 'error');
    toListWorkflowFilters('StartTime = "bogus"', attributes);
    expect(spy).toHaveBeenCalled();
  });

  it('should not throw if given an invalid time in a BETWEEN query', () => {
    expect(() => {
      toListWorkflowFilters(
        'StartTime BETWEEN "bogus" AND "2023-07-28T06:00:00-00:00"',
        attributes,
      );
    }).not.toThrow();

    expect(() => {
      toListWorkflowFilters(
        'StartTime BETWEEN "2023-07-28T00:00:00-00:00" AND "bogus"',
        attributes,
      );
    }).not.toThrow();
  });

  it('should console error if given an invalid start time in a BETWEEN query', () => {
    const spy = vi.spyOn(console, 'error');
    toListWorkflowFilters(
      'StartTime BETWEEN "bogus" AND "2023-07-28T06:00:00-00:00"',
      attributes,
    );
    expect(spy).toHaveBeenCalled();
  });

  it('should console error if given an invalid end time in a BETWEEN query', () => {
    const spy = vi.spyOn(console, 'error');
    toListWorkflowFilters(
      'StartTime BETWEEN "2023-07-28T00:00:00-00:00" AND "bogus"',
      attributes,
    );
    expect(spy).toHaveBeenCalled();
  });
});

describe('combineDropdownFilters', () => {
  it('should combine two filters', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
    ];

    const result = combineDropdownFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should combine two filters with a datetime', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2022-04-20T17:45:18-06:00',
      },
    ];

    const result = combineDropdownFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2022-04-20T17:45:18-06:00',
      },
    ]);
  });

  it('should combine three filters', () => {
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
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
    ];

    const result = combineDropdownFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should combine filters with an OR statement', () => {
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
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
    ];

    const result = combineDropdownFilters(filters);
    expect(result).toEqual([
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
        operator: 'AND',
        parenthesis: ')',
        value: 'Failed',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });
});

describe('combineFilters', () => {
  it('should not add an AND operator if there is no previous filter', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should not add an AND operator if there is already an operator', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Canceled',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
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
        operator: '',
        parenthesis: ')',
        value: 'Canceled',
      },
    ]);
  });

  it('should clear the filter operator if there is no following filter', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should combine two filters', () => {
    const filters = [
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should combine three filters', () => {
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
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should combine filters with an OR statement', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
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
        parenthesis: '',
        value: 'Failed',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
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
        operator: 'AND',
        parenthesis: ')',
        value: 'Failed',
      },
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should clear parenthesis for filters with an OR statement', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'OR',
        parenthesis: ')',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Failed',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
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
    ]);
  });

  it('should clear parenthesis and OR statement if next filter is not the same attribute', () => {
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
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];

    const result = combineFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });

  it('should parse a query with IS NULL', () => {
    const result = toListWorkflowFilters(isEmptyQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: 'is',
        operator: '',
        parenthesis: '',
        value: 'null',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with IS NOT NULL', () => {
    const result = toListWorkflowFilters(isNotEmptyQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: 'IS NOT',
        operator: '',
        parenthesis: '',
        value: 'NULL',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with IS NULL and IS NOT NULL', () => {
    const result = toListWorkflowFilters(
      `${isEmptyQuery} AND ${isNotEmptyQuery}`,
      attributes,
    );
    const expectedFilters = [
      {
        attribute: 'WorkflowType',
        type: 'Keyword',
        conditional: 'is',
        operator: 'AND',
        parenthesis: '',
        value: 'null',
      },
      {
        attribute: 'StartTime',
        type: 'Datetime',
        conditional: 'IS NOT',
        operator: '',
        parenthesis: '',
        value: 'NULL',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });
});
