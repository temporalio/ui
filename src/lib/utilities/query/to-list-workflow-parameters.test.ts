import { parseISO } from 'date-fns';
import { afterEach } from 'vitest';
import { describe, expect, it, vi } from 'vitest';

import {
  getLargestDurationUnit,
  toListWorkflowParameters,
} from './to-list-workflow-parameters';

const executionStatusQuery = 'ExecutionStatus="Completed"';
const workflowIdQuery = 'WorkflowId="Hello"';
const workflowTypeQuery = 'WorkflowType="World"';
const workflowQuery = 'WorkflowId="Hello" and WorkflowType="World"';
const startTimeQuery = 'StartTime > "2022-04-18T17:45:18-06:00"';

const defaultParameters = {
  workflowId: '',
  workflowType: '',
  executionStatus: null,
  timeRange: null,
};

describe('toListWorkflowParameters', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should parse a query with an executionStatus', () => {
    const result = toListWorkflowParameters(executionStatusQuery);

    expect(result).toEqual({
      ...defaultParameters,
      executionStatus: 'Completed',
    });
  });

  it('should parse a query with an workflowId', () => {
    const result = toListWorkflowParameters(workflowIdQuery);

    expect(result).toEqual({ ...defaultParameters, workflowId: 'Hello' });
  });

  it('should parse a query with an workflowType', () => {
    const result = toListWorkflowParameters(workflowTypeQuery);

    expect(result).toEqual({ ...defaultParameters, workflowType: 'World' });
  });

  it('should parse a query with an workflowType', () => {
    const result = toListWorkflowParameters(workflowQuery);

    expect(result).toEqual({
      ...defaultParameters,
      workflowId: 'Hello',
      workflowType: 'World',
    });
  });

  it('should parse a query with an startTime', () => {
    vi.useFakeTimers().setSystemTime(
      parseISO('2022-04-20T17:45:18-06:00').getTime(),
    );
    const result = toListWorkflowParameters(startTimeQuery);

    expect(result).toEqual({ ...defaultParameters, timeRange: '2 days' });
  });

  it('should not throw if given an invalid start time', () => {
    expect(() => {
      toListWorkflowParameters('StartTime = "bogus"');
    }).not.toThrow();
  });

  it('should console error if given an invalid start time', () => {
    const spy = vi.spyOn(console, 'error');
    toListWorkflowParameters('StartTime = "bogus"');
    expect(spy).toHaveBeenCalled();
  });
});

describe('getLargestDurationUnit', () => {
  it('should return years if present', () => {
    const duration: Duration = {
      years: 1,
      months: 2,
      weeks: 3,
      days: 4,
      hours: 5,
      minutes: 6,
      seconds: 7,
    };
    expect(getLargestDurationUnit(duration)).toEqual({
      years: 1,
    });
  });

  it('should return undefined if not given a duration', () => {
    expect(
      getLargestDurationUnit(undefined as unknown as Duration),
    ).toBeUndefined();
  });

  it('should return undefined if not given a duration', () => {
    expect(getLargestDurationUnit({} as unknown as Duration)).toBeUndefined();
  });
});
