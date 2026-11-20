import { describe, expect, it } from 'vitest';

import {
  getPendingActivityTimeouts,
  hasPopulatedActivityOptions,
} from './pending-activity-timeouts';

describe('getPendingActivityTimeouts', () => {
  it('returns no timeouts without a source', () => {
    expect(getPendingActivityTimeouts(undefined)).toEqual([]);
    expect(getPendingActivityTimeouts(null)).toEqual([]);
  });

  it('formats all four timeouts in issue order', () => {
    const timeouts = getPendingActivityTimeouts({
      scheduleToCloseTimeout: '3600s',
      scheduleToStartTimeout: '60s',
      startToCloseTimeout: '600s',
      heartbeatTimeout: '10s',
    });

    expect(timeouts.map((t) => t.field)).toEqual([
      'scheduleToCloseTimeout',
      'scheduleToStartTimeout',
      'startToCloseTimeout',
      'heartbeatTimeout',
    ]);
    expect(timeouts.map((t) => t.formatted)).toEqual([
      '1 hour',
      '1 minute',
      '10 minutes',
      '10 seconds',
    ]);
  });

  it('leaves unset timeouts unformatted so the view can label them', () => {
    const timeouts = getPendingActivityTimeouts({
      scheduleToCloseTimeout: '0s',
      startToCloseTimeout: '30s',
    });

    expect(timeouts.map((t) => t.formatted)).toEqual([
      '',
      '',
      '30 seconds',
      '',
    ]);
  });

  it('accepts proto object durations as well as seconds strings', () => {
    const timeouts = getPendingActivityTimeouts({
      scheduleToCloseTimeout: { seconds: '90', nanos: 0 },
      heartbeatTimeout: { seconds: 45, nanos: 500_000_000 },
    });

    expect(timeouts[0].formatted).toBe('1 minute, 30 seconds');
    expect(timeouts[3].formatted).toBe('45 seconds, 500 milliseconds');
  });
});

describe('hasPopulatedActivityOptions', () => {
  it('is false for missing or stub options', () => {
    expect(hasPopulatedActivityOptions(undefined)).toBe(false);
    expect(hasPopulatedActivityOptions(null)).toBe(false);
    expect(hasPopulatedActivityOptions({})).toBe(false);
    expect(hasPopulatedActivityOptions({ taskQueue: {} })).toBe(false);
  });

  it('is true when a task queue name is present', () => {
    expect(hasPopulatedActivityOptions({ taskQueue: 'demo' })).toBe(true);
    expect(hasPopulatedActivityOptions({ taskQueue: { name: 'demo' } })).toBe(
      true,
    );
  });
});
