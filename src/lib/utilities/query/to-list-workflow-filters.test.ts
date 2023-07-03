import { parseISO } from 'date-fns';
import { afterEach } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import {
  combineDropdownFilters,
  toListWorkflowFilters,
} from './to-list-workflow-filters';

const executionStatusQuery = 'ExecutionStatus="Completed"';
const multipleExecutionStatusQuery =
  '(ExecutionStatus="Canceled" OR ExecutionStatus="Failed" OR ExecutionStatus="Completed")';

const workflowIdQuery = 'WorkflowId="Hello"';
const workflowTypeQuery = 'WorkflowType="World"';
const workflowQuery1 = 'WorkflowId="Hello" AND WorkflowType="World"';
const startTimeQuery = 'StartTime > "2022-04-18T17:45:18-06:00"';
const closeTimeQuery = 'CloseTime > "2022-04-18T17:45:18-06:00"';
const workflowQuery2 =
  'WorkflowType="World" AND StartTime > "2022-04-18T17:45:18-06:00"';
const workflowQuery3 =
  'WorkflowType="World" AND StartTime > "2022-04-18T17:45:18-06:00" AND ExecutionStatus="Canceled"';
const workflowQuery4 =
  '(ExecutionStatus="Canceled" OR ExecutionStatus="Failed" OR ExecutionStatus="Completed") AND WorkflowType="World" AND StartTime > "2022-04-18T17:45:18-06:00"';

const attributes = {
  CloseTime: 'Datetime',
  ExecutionStatus: 'Keyword',
  StartTime: 'Datetime',
  WorkflowId: 'Keyword',
  WorkflowType: 'Keyword',
};

describe('toListWorkflowParameters', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should parse a query with an executionStatus', () => {
    const result = toListWorkflowFilters(executionStatusQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'ExecutionStatus',
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
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Failed',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: '',
        parenthesis: ')',
        value: 'Completed',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with an workflowId', () => {
    const result = toListWorkflowFilters(workflowIdQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowId',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Hello',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with an workflowType', () => {
    const result = toListWorkflowFilters(workflowTypeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with an workflowId and workflowType', () => {
    const result = toListWorkflowFilters(workflowQuery1, attributes);
    const expectedFilters = [
      {
        attribute: 'WorkflowId',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with an startTime', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(startTimeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'StartTime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should parse a query with an closeTime', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowFilters(closeTimeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'CloseTime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
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
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
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
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        conditional: '>',
        operator: 'AND',
        parenthesis: '',
        value: '2 days',
      },
      {
        attribute: 'ExecutionStatus',
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
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Failed',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: 'AND',
        parenthesis: ')',
        value: 'Completed',
      },
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
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
});

describe('combineDropdownFilters', () => {
  it('should combine two filters', () => {
    const filters = [
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'WorkflowId',
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
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
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
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ];

    const result = combineDropdownFilters(filters);
    expect(result).toEqual([
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'StartTime',
        conditional: '>',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ]);
  });

  it('should combine three filters', () => {
    const filters = [
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'WorkflowId',
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
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Running',
      },
      {
        attribute: 'WorkflowId',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
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
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Running',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: '',
        parenthesis: ')',
        value: 'Failed',
      },
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
      {
        attribute: 'WorkflowId',
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
        conditional: '=',
        operator: 'OR',
        parenthesis: '(',
        value: 'Running',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: 'OR',
        parenthesis: '',
        value: 'Canceled',
      },
      {
        attribute: 'ExecutionStatus',
        conditional: '=',
        operator: 'AND',
        parenthesis: ')',
        value: 'Failed',
      },
      {
        attribute: 'WorkflowId',
        conditional: '=',
        operator: 'AND',
        parenthesis: '',
        value: 'Hello',
      },
      {
        attribute: 'WorkflowType',
        conditional: '=',
        operator: '',
        parenthesis: '',
        value: 'World',
      },
    ]);
  });
});
