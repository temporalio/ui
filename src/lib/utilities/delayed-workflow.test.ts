import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toWorkflowExecution } from '$lib/models/workflow-execution';

import { isWorkflowDelayed } from './delayed-workflows';

const past = '2026-11-02T11:00:00.000Z';
const now = '2026-11-02T12:00:00.000Z';
const future = '2026-11-02T13:00:00.000Z';
const later = '2026-11-02T14:00:00.000Z';

const workflow = {
  ...toWorkflowExecution(),
  startTime: past,
  executionTime: future,
  endTime: '',
};

describe('isWorkflowDelayed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true while a start delay has not elapsed', () => {
    expect(isWorkflowDelayed(workflow)).toBe(true);
  });

  it('returns false when execution time is missing', () => {
    expect(isWorkflowDelayed({ ...workflow, executionTime: '' })).toBe(false);
  });

  it('returns false when start time is missing', () => {
    expect(isWorkflowDelayed({ ...workflow, startTime: '' })).toBe(false);
  });

  it('returns false when the start delay has elapsed', () => {
    expect(
      isWorkflowDelayed({
        ...workflow,
        startTime: '2026-11-02T10:00:00.000Z',
        executionTime: past,
      }),
    ).toBe(false);
  });

  it('returns false when execution time is exactly now', () => {
    expect(isWorkflowDelayed({ ...workflow, executionTime: now })).toBe(false);
  });

  it('returns false when start and execution times are equal', () => {
    expect(isWorkflowDelayed({ ...workflow, executionTime: past })).toBe(false);
  });

  it('returns false for a closed workflow even if execution time is in the future', () => {
    expect(isWorkflowDelayed({ ...workflow, endTime: later })).toBe(false);
  });

  it('returns false for a time-skipped workflow with equal future start and execution times', () => {
    expect(isWorkflowDelayed({ ...workflow, startTime: future })).toBe(false);
  });

  it('falls back to browser time to suppress a future start when virtual time is unavailable', () => {
    expect(
      isWorkflowDelayed({
        ...workflow,
        startTime: future,
        executionTime: later,
      }),
    ).toBe(false);
  });

  it('returns false when execution time is ahead of browser time but behind virtual time', () => {
    expect(
      isWorkflowDelayed({
        ...workflow,
        workflowExtendedInfo: {
          timeSkippingInfo: {
            currentTime: later,
          },
        },
      }),
    ).toBe(false);
  });

  it('returns true when start time is ahead of browser time but the delay has not elapsed in virtual time', () => {
    expect(
      isWorkflowDelayed({
        ...workflow,
        startTime: future,
        executionTime: later,
        workflowExtendedInfo: {
          timeSkippingInfo: {
            currentTime: new Date(Date.parse(future) + 60_000).toISOString(),
          },
        },
      }),
    ).toBe(true);
  });

  it('returns false when execution time is exactly the current virtual time', () => {
    expect(
      isWorkflowDelayed({
        ...workflow,
        workflowExtendedInfo: {
          timeSkippingInfo: {
            currentTime: future,
          },
        },
      }),
    ).toBe(false);
  });

  it('returns false when start time is ahead of virtual time', () => {
    expect(
      isWorkflowDelayed({
        ...workflow,
        startTime: future,
        executionTime: later,
        workflowExtendedInfo: {
          timeSkippingInfo: {
            currentTime: now,
          },
        },
      }),
    ).toBe(false);
  });

  it('falls back to browser time when time-skipping info has no current time', () => {
    expect(
      isWorkflowDelayed({
        ...workflow,
        workflowExtendedInfo: {
          timeSkippingInfo: { effectiveConfig: { enabled: true } },
        },
      }),
    ).toBe(true);
  });

  it('returns true when start time is exactly now and execution time is in the future', () => {
    expect(isWorkflowDelayed({ ...workflow, startTime: now })).toBe(true);
  });
});
