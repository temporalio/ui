import { parseISO } from 'date-fns';
import { afterEach } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { toListWorkflowAdvancedParameters } from './to-list-workflow-advanced-parameters';

const executionStatusQuery = 'ExecutionStatus="Completed"';
const multipleExecutionStatusQuery =
  '(ExecutionStatus="Canceled" OR ExecutionStatus="Failed" OR ExecutionStatus="Completed")';

const workflowIdQuery = 'WorkflowId="Hello"';
const workflowTypeQuery = 'WorkflowType="World"';
const workflowQuery1 = 'WorkflowId="Hello" AND WorkflowType="World"';
const startTimeQuery =
  'StartTime BETWEEN "2022-04-18T17:45:18-06:00" AND "2022-04-20T17:45:18-06:00"';
const workflowQuery2 =
  'WorkflowType="World" AND StartTime BETWEEN "2022-04-18T17:45:18-06:00" AND "2022-04-20T17:45:18-06:00"';
const workflowQuery3 =
  'WorkflowType="World" AND StartTime BETWEEN "2022-04-18T17:45:18-06:00" AND "2022-04-20T17:45:18-06:00" AND ExecutionStatus="Canceled"';
const workflowQuery4 =
  '(ExecutionStatus="Canceled" OR ExecutionStatus="Failed" OR ExecutionStatus="Completed") AND WorkflowType="World" AND StartTime BETWEEN "2022-04-18T17:45:18-06:00" AND "2022-04-20T17:45:18-06:00"';

const attributes = {
  BatcherNamespace: 'Keyword',
  BatcherUser: 'Keyword',
  BinaryChecksums: 'Keyword',
  CloseTime: 'Datetime',
  CustomBoolField: 'Bool',
  CustomDatetimeField: 'Datetime',
  CustomDoubleField: 'Double',
  CustomIntField: 'Int',
  CustomKeywordField: 'Keyword',
  CustomStringField: 'Text',
  CustomTextField: 'Text',
  ExecutionDuration: 'Int',
  ExecutionStatus: 'Keyword',
  ExecutionTime: 'Datetime',
  HistoryLength: 'Int',
  RunId: 'Keyword',
  StartTime: 'Datetime',
  StateTransitionCount: 'Int',
  TaskQueue: 'Keyword',
  TemporalChangeVersion: 'Keyword',
  TemporalScheduleInfoJSON: 'Keyword',
  TemporalSchedulePaused: 'Bool',
  TemporalScheduledById: 'Keyword',
  TemporalScheduledStartTime: 'Datetime',
  WorkflowId: 'Keyword',
  WorkflowType: 'Keyword',
};

describe('toListWorkflowParameters', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should parse a query with an executionStatus', () => {
    const result = toListWorkflowAdvancedParameters(
      executionStatusQuery,
      attributes,
    );
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
    const result = toListWorkflowAdvancedParameters(
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
    const result = toListWorkflowAdvancedParameters(
      workflowIdQuery,
      attributes,
    );
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
    const result = toListWorkflowAdvancedParameters(
      workflowTypeQuery,
      attributes,
    );
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
    const result = toListWorkflowAdvancedParameters(workflowQuery1, attributes);
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
    const result = toListWorkflowAdvancedParameters(startTimeQuery, attributes);
    const expectedFilters = [
      {
        attribute: 'StartTime',
        conditional: '',
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
    const result = toListWorkflowAdvancedParameters(workflowQuery2, attributes);
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
        conditional: '',
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
    const result = toListWorkflowAdvancedParameters(workflowQuery3, attributes);
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
        conditional: '',
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
    const result = toListWorkflowAdvancedParameters(workflowQuery4, attributes);
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
        conditional: '',
        operator: '',
        parenthesis: '',
        value: '2 days',
      },
    ];
    expect(result).toEqual(expectedFilters);
  });

  it('should not throw if given an invalid start time', () => {
    expect(() => {
      toListWorkflowAdvancedParameters('StartTime = "bogus"', attributes);
    }).not.toThrow();
  });

  it('should console error if given an invalid start time', () => {
    const spy = vi.spyOn(console, 'error');
    toListWorkflowAdvancedParameters('StartTime = "bogus"', attributes);
    expect(spy).toHaveBeenCalled();
  });
});
