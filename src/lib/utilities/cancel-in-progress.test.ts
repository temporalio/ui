import { describe, expect, it } from 'vitest';

import { isCancelInProgress } from './cancel-in-progress';

import canceledEvents from '$fixtures/events.canceled.json';
import failedEvents from '$fixtures/events.failed.json';

describe('isCancelInProgress', () => {
  it('should return true if running and not updating and CancelRequested event', () => {
    expect(isCancelInProgress('Running', canceledEvents)).toBe(true);
  });

  it('should return false if running and not updating and no CancelRequested event', () => {
    expect(isCancelInProgress('Running', failedEvents)).toBe(false);
  });

  it('should return false if completed and updating and no CancelRequested event', () => {
    expect(isCancelInProgress('Completed', canceledEvents)).toBe(false);
  });

  it('should return false if no history', () => {
    expect(isCancelInProgress('Running', [])).toBe(false);
  });
});
