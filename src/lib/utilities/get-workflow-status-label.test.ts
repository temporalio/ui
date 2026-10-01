import { describe, expect, it } from 'vitest';

import { getWorkflowStatusLabel } from './get-workflow-status-label';

describe('getWorkflowStatusLabel', () => {
  it('translates workflow and schedule statuses', () => {
    expect(getWorkflowStatusLabel('Running')).toBe('Running');
    expect(getWorkflowStatusLabel('TimedOut')).toBe('Timed Out');
    expect(getWorkflowStatusLabel('ContinuedAsNew')).toBe('Continued as New');
    expect(getWorkflowStatusLabel('Paused')).toBe('Paused');
  });

  it('falls back to "Unknown" for null or undefined', () => {
    expect(getWorkflowStatusLabel(undefined)).toBe('Unknown');
    expect(getWorkflowStatusLabel(null)).toBe('Unknown');
  });
});
