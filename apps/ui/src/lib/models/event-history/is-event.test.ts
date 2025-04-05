import { describe, expect, it } from 'vitest';

import { isEvent } from '.';

describe('isEvent', () => {
  it('should return true if the event has an eventType', () => {
    expect(isEvent({ eventType: 'Workflow Started' })).toBe(true);
  });

  it('should return false if the event does not have an eventType', () => {
    expect(isEvent({ activityType: 'Workflow Started' })).toBe(false);
  });

  it('should return false if passed null', () => {
    expect(isEvent(null)).toBe(false);
  });

  it('should return false if passed a string', () => {
    expect(isEvent('string')).toBe(false);
  });

  it('should return false if passed a number', () => {
    expect(isEvent(4)).toBe(false);
  });

  it('should return false if passed an array', () => {
    expect(isEvent([])).toBe(false);
  });
});
