import { describe, expect, it } from 'vitest';

import { isCancelInProgress } from './cancel-in-progress';

import canceledEvents from '$fixtures/events.canceled.json';
import failedEvents from '$fixtures/events.failed.json';
import runningEvents from '$fixtures/events.running.json';

describe('isCancelInProgress', () => {
  it('should return true if running and not updating and CancelRequested event', () => {
    const history = { start: runningEvents, end: canceledEvents };
    expect(isCancelInProgress('Running', history)).toBe(true);
  });

  it('should return false if running and not updating and no CancelRequested event', () => {
    const history = { start: runningEvents, end: failedEvents };
    expect(isCancelInProgress('Running', history)).toBe(false);
  });

  it('should return false if completed and updating and no CancelRequested event', () => {
    const history = { start: runningEvents, end: canceledEvents };
    expect(isCancelInProgress('Completed', history)).toBe(false);
  });

  it('should return false if no history', () => {
    const history = { start: [], end: [] };
    expect(isCancelInProgress('Running', history)).toBe(false);
  });
});
