import { describe, expect, it } from 'vitest';

import { format } from './format-camel-case';

describe('format', () => {
  it('should format WorkflowExecutionStarted as "Workflow Execution Started"', () => {
    expect(format('WorkflowExecutionStarted')).toBe(
      'Workflow Execution Started',
    );
  });

  it('should format lastCompletionResult as "Last Completion Result"', () => {
    expect(format('lastCompletionResult')).toBe('Last Completion Result');
  });

  it('should format attempt as "Workflow Attempt"', () => {
    expect(format('attempt')).toBe('Attempt');
  });

  it('should format requestId as "Request ID"', () => {
    expect(format('requestId')).toBe('Request ID');
  });

  it('should format startedEventId as "Started Event ID"', () => {
    expect(format('startedEventId')).toBe('Started Event ID');
  });

  it('should format identity as "Identity"', () => {
    expect(format('identity')).toBe('Identity');
  });

  it('should format identityAnotherWord as "Identity Another Word"', () => {
    expect(format('identityAnotherWord')).toBe('Identity Another Word');
  });

  it('should format requestIdSomething as "Request ID Something"', () => {
    expect(format('requestIdSomething')).toBe('Request ID Something');
  });

  it('should format workflowType as "Workflow Type Name"', () => {
    expect(format('workflowType')).toBe('Workflow Type Name');
  });

  it('should format undefined as ""', () => {
    expect(format()).toBe('');
  });
});
