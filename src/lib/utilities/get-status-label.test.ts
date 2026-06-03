import { describe, expect, it } from 'vitest';

import { getStatusLabel, type Status } from './get-status-label';

describe('getStatusLabel', () => {
  it('translates workflow statuses', () => {
    expect(getStatusLabel('Running')).toBe('Running');
    expect(getStatusLabel('TimedOut')).toBe('Timed Out');
    expect(getStatusLabel('Completed')).toBe('Completed');
    expect(getStatusLabel('Failed')).toBe('Failed');
    expect(getStatusLabel('ContinuedAsNew')).toBe('Continued as New');
    expect(getStatusLabel('Canceled')).toBe('Canceled');
    expect(getStatusLabel('Terminated')).toBe('Terminated');
    expect(getStatusLabel('Paused')).toBe('Paused');
  });

  it('translates event classifications', () => {
    expect(getStatusLabel('Scheduled')).toBe('Scheduled');
    expect(getStatusLabel('CancelRequested')).toBe('Cancel Requested');
    expect(getStatusLabel('Signaled')).toBe('Signaled');
    expect(getStatusLabel('Fired')).toBe('Fired');
  });

  it('translates pending and retrying states', () => {
    expect(getStatusLabel('Pending')).toBe('Pending');
    expect(getStatusLabel('Retrying')).toBe('Retrying');
  });

  it('falls back to "Unknown" for undefined or unmapped values', () => {
    expect(getStatusLabel(undefined)).toBe('Unknown');
    expect(getStatusLabel('NotAStatus' as Status)).toBe('Unknown');
  });
});
