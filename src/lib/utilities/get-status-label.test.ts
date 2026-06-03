import { describe, expect, it } from 'vitest';

import {
  getEventClassificationLabel,
  getStatusLabel,
  getWorkflowStatusLabel,
  type Status,
} from './get-status-label';

describe('getWorkflowStatusLabel', () => {
  it('translates workflow / schedule statuses', () => {
    expect(getWorkflowStatusLabel('Running')).toBe('Running');
    expect(getWorkflowStatusLabel('TimedOut')).toBe('Timed Out');
    expect(getWorkflowStatusLabel('ContinuedAsNew')).toBe('Continued as New');
    expect(getWorkflowStatusLabel('Paused')).toBe('Paused');
  });

  it('falls back to "Unknown" for null / undefined / event-only names', () => {
    expect(getWorkflowStatusLabel(undefined)).toBe('Unknown');
    expect(getWorkflowStatusLabel(null)).toBe('Unknown');
    // Event-only classification is not part of the workflow domain.
    expect(getWorkflowStatusLabel('Signaled' as never)).toBe('Unknown');
  });
});

describe('getEventClassificationLabel', () => {
  it('translates event classifications, pending and retrying', () => {
    expect(getEventClassificationLabel('Scheduled')).toBe('Scheduled');
    expect(getEventClassificationLabel('CancelRequested')).toBe(
      'Cancel Requested',
    );
    expect(getEventClassificationLabel('Pending')).toBe('Pending');
    expect(getEventClassificationLabel('Retrying')).toBe('Retrying');
  });

  it('resolves overlapping names via the event namespace', () => {
    // Same English today, but routed through events.* — not workflows.*.
    expect(getEventClassificationLabel('Completed')).toBe('Completed');
    expect(getEventClassificationLabel('Failed')).toBe('Failed');
  });

  it('falls back to "Unknown" for undefined / unmapped values', () => {
    expect(getEventClassificationLabel(undefined)).toBe('Unknown');
  });
});

describe('getStatusLabel (combined, workflow-domain precedence)', () => {
  it('labels both workflow statuses and event classifications', () => {
    expect(getStatusLabel('Completed')).toBe('Completed');
    expect(getStatusLabel('Signaled')).toBe('Signaled');
    expect(getStatusLabel('Pending')).toBe('Pending');
  });

  it('falls back to "Unknown" for null / undefined / unmapped values', () => {
    expect(getStatusLabel(undefined)).toBe('Unknown');
    expect(getStatusLabel(null)).toBe('Unknown');
    expect(getStatusLabel('NotAStatus' as Status)).toBe('Unknown');
  });
});
