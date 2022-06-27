import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toListWorkflowQuery } from './list-workflow-query';

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

  it('should convert an timeRange with a Duration as a value', () => {
    const tomorrow = '2020-01-02T00:00:00Z';
    const twentyFourHoursEarlier = '2019-12-31T00:00:00Z';

    const query = toListWorkflowQuery({ timeRange: { hours: 24 } });

    expect(query).toBe(
      `StartTime BETWEEN "${twentyFourHoursEarlier}" AND "${tomorrow}"`,
    );
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
