import { describe, expect, it } from 'vitest';

import type { RunCounts } from '$lib/models/event-history/run-counts';

import { nonZeroCountDisplays } from './run-count-displays';

const counts = (overrides: Partial<RunCounts> = {}): RunCounts => ({
  activities: 0,
  childWorkflows: 0,
  timers: 0,
  signals: 0,
  nexusOperations: 0,
  updates: 0,
  succeeded: 0,
  failed: 0,
  retried: 0,
  ...overrides,
});

describe('nonZeroCountDisplays', () => {
  it('keeps only categories with a count, in display order', () => {
    expect(
      nonZeroCountDisplays(counts({ updates: 1, activities: 2 })).map(
        ({ key }) => key,
      ),
    ).toEqual(['activities', 'updates']);
  });
});
