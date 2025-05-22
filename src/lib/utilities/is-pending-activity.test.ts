import { describe, expect, it } from 'vitest';

import {
  isPendingActivity,
  isPendingNexusOperation,
} from './is-pending-activity';

describe('isPendingActivity', () => {
  it('should return true if the event has an activityType', () => {
    expect(
      isPendingActivity({ activityType: { name: 'Workflow Started' } }),
    ).toBe(true);
  });

  it('should return false if the event does not have an activityType', () => {
    expect(isPendingActivity({ eventType: 'Workflow Started' })).toBe(false);
  });

  it('should return false if passed null', () => {
    expect(isPendingActivity(null)).toBe(false);
  });

  it('should return false if passed a string', () => {
    expect(isPendingActivity('string')).toBe(false);
  });

  it('should return false if passed a number', () => {
    expect(isPendingActivity(4)).toBe(false);
  });

  it('should return false if passed an array', () => {
    expect(isPendingActivity([])).toBe(false);
  });
});

describe('isPendingNexusOperation', () => {
  it('should return true if the event has operation and endpoint properties', () => {
    expect(
      isPendingNexusOperation({
        operation: 'test-operation',
        endpoint: 'test-endpoint',
      }),
    ).toBe(true);
  });

  it('should return false if the event is missing the operation property', () => {
    expect(isPendingNexusOperation({ endpoint: 'test-endpoint' })).toBe(false);
  });

  it('should return false if the event is missing the endpoint property', () => {
    expect(isPendingNexusOperation({ operation: 'test-operation' })).toBe(
      false,
    );
  });

  it('should return false if passed null', () => {
    expect(isPendingNexusOperation(null)).toBe(false);
  });

  it('should return false if passed a string', () => {
    expect(isPendingNexusOperation('string')).toBe(false);
  });

  it('should return false if passed a number', () => {
    expect(isPendingNexusOperation(4)).toBe(false);
  });

  it('should return false if passed an array', () => {
    expect(isPendingNexusOperation([])).toBe(false);
  });
});
