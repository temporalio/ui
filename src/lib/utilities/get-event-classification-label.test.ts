import { describe, expect, it } from 'vitest';

import { getEventClassificationLabel } from './get-event-classification-label';

describe('getEventClassificationLabel', () => {
  it('translates event classifications, pending, and retrying', () => {
    expect(getEventClassificationLabel('Scheduled')).toBe('Scheduled');
    expect(getEventClassificationLabel('CancelRequested')).toBe(
      'Cancel Requested',
    );
    expect(getEventClassificationLabel('Pending')).toBe('Pending');
    expect(getEventClassificationLabel('Retrying')).toBe('Retrying');
  });

  it('resolves overlapping names through the event namespace', () => {
    expect(getEventClassificationLabel('Completed')).toBe('Completed');
    expect(getEventClassificationLabel('Failed')).toBe('Failed');
  });

  it('falls back to "Unknown" for undefined', () => {
    expect(getEventClassificationLabel(undefined)).toBe('Unknown');
  });
});
