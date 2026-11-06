import { describe, expect, it } from 'vitest';

import { getPendingActivityElapsed } from './pending-activity-elapsed';

const now = new Date('2026-10-25T12:00:00.000Z');
const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 3_600_000).toISOString();
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000).toISOString();

describe('getPendingActivityElapsed', () => {
  it('splits the current attempt elapsed from the total elapsed for a started activity', () => {
    const elapsed = getPendingActivityElapsed(
      {
        state: 'Started',
        lastStartedTime: minutesAgo(30),
        lastAttemptCompleteTime: minutesAgo(45),
        scheduledTime: hoursAgo(3),
      },
      hoursAgo(2),
      now,
    );

    expect(elapsed.currentAttempt).toBe('30 minutes');
    expect(elapsed.total).toBe('2 hours');
  });

  it('measures a waiting attempt from when the previous attempt completed', () => {
    const elapsed = getPendingActivityElapsed(
      {
        state: 'Scheduled',
        lastStartedTime: hoursAgo(1),
        lastAttemptCompleteTime: minutesAgo(10),
        scheduledTime: hoursAgo(3),
      },
      hoursAgo(2),
      now,
    );

    expect(elapsed.currentAttempt).toBe('10 minutes');
    expect(elapsed.total).toBe('2 hours');
  });

  it('falls back to the scheduled time for a first attempt that has not started', () => {
    const elapsed = getPendingActivityElapsed(
      {
        state: 'Scheduled',
        lastStartedTime: null,
        lastAttemptCompleteTime: null,
        scheduledTime: minutesAgo(5),
      },
      minutesAgo(5),
      now,
    );

    expect(elapsed.currentAttempt).toBe('5 minutes');
    expect(elapsed.total).toBe('5 minutes');
  });

  it('falls back to the pending activity scheduledTime when the scheduled event is unavailable', () => {
    const elapsed = getPendingActivityElapsed(
      {
        state: 'Started',
        lastStartedTime: minutesAgo(20),
        lastAttemptCompleteTime: null,
        scheduledTime: hoursAgo(1),
      },
      undefined,
      now,
    );

    expect(elapsed.currentAttempt).toBe('20 minutes');
    expect(elapsed.total).toBe('1 hour');
  });

  it('returns empty strings when no time anchors exist', () => {
    const elapsed = getPendingActivityElapsed(
      {
        state: 'Scheduled',
        lastStartedTime: null,
        lastAttemptCompleteTime: null,
        scheduledTime: null,
      },
      undefined,
      now,
    );

    expect(elapsed).toEqual({ currentAttempt: '', total: '' });
  });
});
