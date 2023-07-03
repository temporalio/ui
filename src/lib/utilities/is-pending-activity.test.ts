import { describe, expect, it } from 'vitest';

import { isPendingActivity } from './is-pending-activity';

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
