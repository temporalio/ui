import { describe, expect, it } from 'vitest';

import { getWorkflowStatus } from './workflow-status';

describe('getWorkflowStatus', () => {
  it('shows the terminal status of a loaded run', () => {
    expect(
      getWorkflowStatus('WorkflowExecutionContinuedAsNew', 'loaded').label,
    ).toBe('Continued as new');
    expect(
      getWorkflowStatus('WorkflowExecutionCompleted', 'loaded').label,
    ).toBe('Completed');
    expect(getWorkflowStatus('WorkflowExecutionFailed', 'loaded').label).toBe(
      'Failed',
    );
  });

  it('distinguishes loading, failure, and an active run', () => {
    expect(getWorkflowStatus(undefined, 'pending').label).toBe(
      'Loading history',
    );
    expect(getWorkflowStatus(undefined, 'failed').label).toBe(
      'History unavailable',
    );
    expect(getWorkflowStatus('WorkflowExecutionStarted', 'loaded').label).toBe(
      'Running',
    );
  });
});
