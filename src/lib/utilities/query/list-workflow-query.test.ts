import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isFilterKey, toListWorkflowQuery } from './list-workflow-query';
import { isVersionNewer } from '../version-check';

describe('toListWorkflowQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01').getTime());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should convert an executionStatus', () => {
    const query = toListWorkflowQuery({ executionStatus: 'Running' });
    expect(query).toBe('ExecutionStatus="Running"');
  });

  it('should return an empty string for "All"', () => {
    const query = toListWorkflowQuery({ executionStatus: 'All' });
    expect(query).toBe('');
  });

  it('should ignore undefined values', () => {
    const query = toListWorkflowQuery({
      executionStatus: undefined,
      workflowId: 'abcdef123',
    });
    expect(query).toBe('WorkflowId="abcdef123"');
  });

  it('should ignore empty strings', () => {
    const query = toListWorkflowQuery({
      executionStatus: '',
      workflowId: 'abcdef123',
    });
    expect(query).toBe('WorkflowId="abcdef123"');
  });

  it('should convert an timeRange with a Duration as a value', () => {
    const twentyFourHoursEarlier = '2019-12-31T00:00:00Z';

    const supportsAdvancedVisibility = isVersionNewer('1.20', '1.19');
    const query = toListWorkflowQuery(
      { timeRange: { hours: 24 } },
      supportsAdvancedVisibility,
    );
    expect(query).toBe(`StartTime > "${twentyFourHoursEarlier}"`);
  });

  it('should convert an timeRange with a Duration as a value when archived', () => {
    const twentyFourHoursEarlier = '2019-12-31T00:00:00Z';

    const query = toListWorkflowQuery({ timeRange: { days: 1 } }, true);

    expect(query).toBe(`StartTime > "${twentyFourHoursEarlier}"`);
  });

  it('should convert an two values using an "and"', () => {
    const query = toListWorkflowQuery({
      executionStatus: 'Running',
      workflowId: 'abcdef123',
    });

    expect(query).toBe('ExecutionStatus="Running" and WorkflowId="abcdef123"');
  });

  it('should convert an three values using an "and"', () => {
    const query = toListWorkflowQuery({
      executionStatus: 'Running',
      workflowId: 'abcdef123',
      workflowType: 'ImportantBusinessTransaction',
    });

    expect(query).toBe(
      'ExecutionStatus="Running" and WorkflowId="abcdef123" and WorkflowType="ImportantBusinessTransaction"',
    );
  });

  it('should drop null values', () => {
    const query = toListWorkflowQuery({
      executionStatus: 'Running',
      workflowId: 'abcdef123',
      workflowType: null,
    });

    expect(query).toBe('ExecutionStatus="Running" and WorkflowId="abcdef123"');
  });

  it('should drop "undefined" which can be returned from inputs', () => {
    const query = toListWorkflowQuery({
      executionStatus: 'Running',
      workflowId: 'abcdef123',
      workflowType: 'undefined',
    });

    expect(query).toBe('ExecutionStatus="Running" and WorkflowId="abcdef123"');
  });
});

describe('isFilterKey', () => {
  it('should return true for workflowId', () => {
    expect(isFilterKey('workflowId')).toBe(true);
  });

  it('should return true for workflowType', () => {
    expect(isFilterKey('workflowType')).toBe(true);
  });

  it('should return true for timeRange', () => {
    expect(isFilterKey('timeRange')).toBe(true);
  });

  it('should return true for executionStatus', () => {
    expect(isFilterKey('executionStatus')).toBe(true);
  });

  it('should return true for closeTime', () => {
    expect(isFilterKey('closeTime')).toBe(true);
  });

  it('should return false for null', () => {
    expect(isFilterKey(null)).toBe(false);
  });

  it('should return false for numbers', () => {
    expect(isFilterKey(12)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isFilterKey([])).toBe(false);
  });

  it('should return false for bogus keys', () => {
    expect(isFilterKey('not a real key')).toBe(false);
  });
});
