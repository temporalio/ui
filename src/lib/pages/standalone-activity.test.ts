import * as SvelteReactivity from 'svelte/reactivity';

import { describe, expect, test, vi } from 'vitest';

import type { ActivityExecution } from '$lib/types/activity-execution';

import { StandaloneActivity } from './standalone-activity.svelte';

const MOCK_RETRYING_ACTIVITY: ActivityExecution = {
  runId: '019d2ad0-26a1-72f9-8295-d4d82cb56c22',
  info: {
    activityId: '91246338-45c8-4f5b-9f8e-dd5aa9c8e450',
    runId: '019d2ad0-26a1-72f9-8295-d4d82cb56c22',
    activityType: {
      name: 'LongRunningActivity',
    },
    status: 'ACTIVITY_EXECUTION_STATUS_RUNNING',
    runState: 'PENDING_ACTIVITY_STATE_SCHEDULED',
    taskQueue: 'session-failure',
    scheduleToCloseTimeout: '0s',
    scheduleToStartTimeout: '0s',
    startToCloseTimeout: '10s',
    heartbeatTimeout: '0s',
    retryPolicy: {
      initialInterval: '1s',
      backoffCoefficient: 2,
      maximumInterval: '100s',
      maximumAttempts: 60,
    },
    lastStartedTime: '2026-01-01T00:01:00.000000Z',
    attempt: 10,
    scheduleTime: '2026-01-01T00:00:00.000000Z',
    lastFailure: {},
    lastWorkerIdentity: '34096@MacBookPro.localdomain@',
    currentRetryInterval: '100s',
    lastAttemptCompleteTime: '2026-01-01T00:01:05.000000Z',
    nextAttemptScheduleTime: '2026-01-01T00:01:40.000000Z',
    stateTransitionCount: '33',
    searchAttributes: {},
    userMetadata: {},
  },
  longPollToken: '',
};

vi.mock('svelte/reactivity', async (importOriginal) => {
  const original = (await importOriginal()) as typeof SvelteReactivity;
  const date = new Date(2026, 0, 1, 0, 0, 0, 0);

  class MockSvelteDate {
    static now() {
      return date.getTime();
    }

    getSeconds() {
      return date.getSeconds();
    }

    setSeconds(seconds: number) {
      date.setSeconds(seconds);
    }

    getTime() {
      return date.getTime();
    }

    constructor(...args: ConstructorParameters<typeof Date>) {
      return new Date(...args);
    }
  }

  return {
    ...original,
    SvelteDate: MockSvelteDate,
  };
});

describe('Standalone Activity Page Class', () => {
  test('derived properties are set for a retrying activity', () => {
    const activity = new StandaloneActivity(MOCK_RETRYING_ACTIVITY);

    expect(activity.attemptsRemaining).toEqual(50);
    expect(activity.running).toBe(true);
    expect(activity.upcomingAttempts.length).toBe(51); // includes current attempt
    expect(activity.secondsRemaining).toBe(5500);
    expect(activity.nextRetrySecondsLeft).toBe('1m 40s');
    expect(activity.deadlineTime.toISOString()).toBe(
      '2026-01-01T01:32:45.000Z',
    );
    expect(activity.startToCloseSecondsLeft).toBe(70);
    expect(activity.scheduleToCloseSecondsLeft).toBe(undefined);
  });

  const cases = [
    [1, 1],
    [2, 2],
    [3, 4],
    [4, 8],
    [5, 16],
    [6, 32],
    [7, 64],
    [8, 100],
  ];

  test.each(cases)(
    'intervalForAttempt %i is %i seconds',
    (attempt, interval) => {
      const activity = new StandaloneActivity(MOCK_RETRYING_ACTIVITY);

      expect(activity.intervalForAttempt(attempt)).toBe(interval);
    },
  );
});
