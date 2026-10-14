import { describe, expect, it } from 'vitest';

import type { HistoryEvent, PendingActivityInfo } from '$lib/types/events';

import {
  buildChainSteps,
  type ChainRun,
  chainRunWindow,
  payloadBytes,
  summarizeRun,
} from './run-chain';

const event = (eventId: string, seconds: number, attributes: object) =>
  ({
    eventId,
    eventTime: new Date(seconds * 1000).toISOString(),
    ...attributes,
  }) as unknown as HistoryEvent;

describe('run chain model', () => {
  it('uses pending activity identity for live attempts, never overwriting terminal history or another run', () => {
    const run: ChainRun = {
      runId: 'live',
      status: 'Running',
      startTime: 0,
      eventCount: '4',
    };
    const scheduled = event('2', 1, {
      activityTaskScheduledEventAttributes: {
        activityId: 'payment',
        activityType: { name: 'charge' },
      },
    });
    const live = {
      runId: 'live',
      fetchedAt: 2000,
      pendingActivities: [
        {
          activityId: 'payment',
          attempt: 3,
          maximumAttempts: 10,
          state: 'PENDING_ACTIVITY_STATE_SCHEDULED',
          lastFailure: { message: 'provider unavailable' },
        } as unknown as PendingActivityInfo,
      ],
    };
    expect(buildChainSteps([scheduled], run, live)[0]).toMatchObject({
      status: 'Retrying',
      attempts: 3,
      maximumAttempts: 10,
      lastFailure: 'provider unavailable',
    });
    expect(
      buildChainSteps([scheduled], run, { ...live, runId: 'old' })[0],
    ).toMatchObject({ status: 'Scheduled' });
    const completed = event('3', 4, {
      activityTaskCompletedEventAttributes: { scheduledEventId: '2' },
    });
    expect(buildChainSteps([scheduled, completed], run, live)[0]).toMatchObject(
      { status: 'Completed', closeTime: 4000 },
    );
    live.pendingActivities[0].state = 2;
    expect(buildChainSteps([scheduled], run, live)[0].status).toBe('Running');
    live.pendingActivities[0].paused = true;
    expect(buildChainSteps([scheduled], run, live)[0].status).toBe('Paused');
  });
  it('only follows explicit Continue-As-New close events', () => {
    const first = event('1', 0, {
      workflowExecutionStartedEventAttributes: {
        continuedExecutionRunId: 'previous',
      },
    });
    const failed = event('10', 30, {
      workflowExecutionFailedEventAttributes: { newExecutionRunId: 'retry' },
    });
    expect(summarizeRun('run', first, failed)).toMatchObject({
      status: 'Failed',
      previousRunId: 'previous',
      nextRunId: undefined,
      closeTime: 30000,
    });
    const continued = event('10', 30, {
      workflowExecutionContinuedAsNewEventAttributes: {
        newExecutionRunId: 'next',
      },
    });
    expect(summarizeRun('run', first, continued)).toMatchObject({
      status: 'Continued as new',
      nextRunId: 'next',
    });
  });

  it('measures the encoded size of the state a run received', () => {
    expect(payloadBytes(undefined)).toBeUndefined();
    expect(payloadBytes({ payloads: [] })).toBe(0);
    expect(
      payloadBytes({
        payloads: [
          { metadata: { encoding: 'anNvbi9wbGFpbg==' }, data: 'eyJhIjoxfQ==' },
          { data: new Uint8Array(5) },
        ],
      }),
    ).toBe(10 + 7 + 5);
    const started = event('1', 0, {
      workflowExecutionStartedEventAttributes: {
        input: { payloads: [{ data: 'eyJhIjoxfQ==' }] },
      },
    });
    expect(summarizeRun('run', started, started).inputBytes).toBe(7);
  });

  it('matches out-of-order activity completions and assigns overlap lanes', () => {
    const events = [
      event('2', 1, {
        activityTaskScheduledEventAttributes: {
          activityType: { name: 'slow' },
        },
      }),
      event('3', 1, {
        activityTaskScheduledEventAttributes: {
          activityType: { name: 'fast' },
        },
      }),
      event('4', 2, {
        activityTaskCompletedEventAttributes: { scheduledEventId: '3' },
      }),
      event('5', 3, {
        activityTaskFailedEventAttributes: { scheduledEventId: '2' },
      }),
      event('6', 4, { timerStartedEventAttributes: { timerId: 'cooldown' } }),
      event('7', 5, { timerFiredEventAttributes: { startedEventId: '6' } }),
    ];
    const steps = buildChainSteps(events, {
      runId: 'run',
      status: 'Running',
      startTime: 0,
      eventCount: '7',
    });
    expect(steps).toMatchObject([
      { name: 'slow', lane: 0, status: 'Failed', closeTime: 3000 },
      { name: 'fast', lane: 1, status: 'Completed', closeTime: 2000 },
      { name: 'Timer cooldown', lane: 0, status: 'Completed', closeTime: 5000 },
    ]);
  });

  it('stops unfinished spans when a run is terminated', () => {
    const steps = buildChainSteps(
      [event('2', 1, { timerStartedEventAttributes: { timerId: 'wait' } })],
      {
        runId: 'run',
        status: 'Terminated',
        startTime: 0,
        closeTime: 5000,
        eventCount: '3',
      },
    );
    expect(steps[0]).toMatchObject({ status: 'Interrupted', closeTime: 5000 });
  });

  it('preserves the final attempt count for recovered activities', () => {
    const run: ChainRun = {
      runId: 'run',
      status: 'Running',
      startTime: 0,
      eventCount: '4',
    };
    const steps = buildChainSteps(
      [
        event('2', 1, {
          activityTaskScheduledEventAttributes: {
            activityType: { name: 'charge' },
          },
        }),
        event('3', 5, {
          activityTaskStartedEventAttributes: {
            scheduledEventId: '2',
            attempt: 4,
          },
        }),
        event('4', 7, {
          activityTaskCompletedEventAttributes: { scheduledEventId: '2' },
        }),
      ],
      run,
    );
    expect(steps[0]).toMatchObject({
      status: 'Completed',
      attempts: 4,
      startTime: 1000,
      closeTime: 7000,
    });
  });

  it('shows the latest ten runs and can anchor a ten-run window back to the first', () => {
    const runs = Array.from(
      { length: 101 },
      (_, index): ChainRun => ({
        runId: String(index),
        status: 'Completed',
        startTime: index,
        eventCount: '10',
      }),
    );
    expect(chainRunWindow(runs)).toEqual(runs.slice(-10));
    expect(chainRunWindow(runs, '50')).toEqual(runs.slice(41, 51));
    expect(chainRunWindow(runs, '0')).toEqual(runs.slice(0, 10));
    expect(chainRunWindow(runs.slice(0, 3))).toEqual(runs.slice(0, 3));
    expect(chainRunWindow([])).toEqual([]);
    expect(chainRunWindow(runs.slice(20), '50')).toEqual(
      chainRunWindow(runs, '50'),
    );
  });
});
