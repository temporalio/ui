import { describe, expect, it } from 'vitest';

import { isWorkflowOpen } from './workflow-status';

describe('isWorkflowOpen', () => {
  it('treats running and paused workflows as open', () => {
    expect(isWorkflowOpen({ isRunning: true, isPaused: false })).toBe(true);
    expect(isWorkflowOpen({ isRunning: false, isPaused: true })).toBe(true);
  });

  it('treats a closed workflow as not open', () => {
    expect(isWorkflowOpen({ isRunning: false, isPaused: false })).toBe(false);
  });
});
