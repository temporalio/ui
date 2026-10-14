import { describe, expect, it } from 'vitest';

import type { HistoryEvent } from '$lib/types/events';

import type { ChainRun } from './run-chain';
import {
  compareRuns,
  runAttention,
  stateGrowth,
  summarizeRunWork,
} from './run-chain-comparison';
import { RunSummaryAccumulator, summarizeSteps } from './run-chain-summary';

const run = (runId = 'run', duration = 30_000): ChainRun => ({
  runId,
  startTime: 0,
  closeTime: duration,
  status: 'Continued as new',
  eventCount: '99',
});
const event = (eventId: number, attributes: object) =>
  ({
    eventId: String(eventId),
    eventTime: new Date(eventId * 100).toISOString(),
    ...attributes,
  }) as unknown as HistoryEvent;

describe('run comparison', () => {
  it('flags carried state that keeps growing between runs', () => {
    const sized = (...sizes: (number | undefined)[]) =>
      sizes.map((inputBytes, index) => ({
        ...run(`run-${index}`),
        inputBytes,
      }));
    expect(stateGrowth(sized(10, 20, 30), 2)).toEqual({
      bytes: 30,
      change: 10,
      growing: true,
    });
    expect(stateGrowth(sized(10, 20, 30), 1).growing).toBe(false);
    expect(stateGrowth(sized(10, 30, 20), 2)).toMatchObject({
      change: -10,
      growing: false,
    });
    expect(stateGrowth(sized(10, 10, 30), 2).growing).toBe(false);
    expect(stateGrowth(sized(10, undefined, 30), 2)).toEqual({
      bytes: 30,
      change: undefined,
      growing: false,
    });
  });

  it.each(['LocalActivity', 'core_local_activity'])(
    'counts %s markers as local activities',
    (markerName) => {
      const scan = new RunSummaryAccumulator();
      scan.append([
        event(1, { markerRecordedEventAttributes: { markerName } }),
        event(2, {
          markerRecordedEventAttributes: { markerName: 'core_patch' },
        }),
      ]);
      const result = summarizeRunWork(scan.snapshot(run(), true));
      expect(
        Object.fromEntries(
          result.primitives.map((p) => [p.kind, p.counts.total]),
        ),
      ).toEqual({ 'local-activity': 1, other: 1 });
    },
  );

  it('counts logical primitives once across pages and preserves their outcomes', () => {
    const scan = new RunSummaryAccumulator();
    const events = [
      event(1, {
        startChildWorkflowExecutionInitiatedEventAttributes: {
          workflowType: { name: 'Child' },
        },
      }),
      event(2, {
        workflowExecutionUpdateAdmittedEventAttributes: {
          request: {
            meta: { updateId: 'update-1' },
            input: { name: 'Review' },
          },
        },
      }),
      event(3, {
        nexusOperationScheduledEventAttributes: {
          service: 'payments',
          operation: 'charge',
        },
      }),
      event(4, {
        signalExternalWorkflowExecutionInitiatedEventAttributes: {
          signalName: 'wake',
        },
      }),
      event(5, {
        childWorkflowExecutionStartedEventAttributes: { initiatedEventId: '1' },
      }),
      event(6, {
        workflowExecutionUpdateAcceptedEventAttributes: {
          protocolInstanceId: 'update-1',
        },
      }),
      event(7, {
        nexusOperationStartedEventAttributes: { scheduledEventId: '3' },
      }),
      event(8, {
        workflowExecutionSignaledEventAttributes: { signalName: 'ready' },
      }),
      event(9, {
        markerRecordedEventAttributes: { markerName: 'LocalActivity' },
      }),
      event(10, { markerRecordedEventAttributes: { markerName: 'Version' } }),
      event(11, {
        childWorkflowExecutionCompletedEventAttributes: {
          initiatedEventId: '1',
        },
      }),
      event(12, {
        workflowExecutionUpdateCompletedEventAttributes: {
          acceptedEventId: '6',
          outcome: { failure: { message: 'Rejected by handler' } },
        },
      }),
      event(13, {
        nexusOperationTimedOutEventAttributes: { scheduledEventId: '3' },
      }),
      event(14, {
        signalExternalWorkflowExecutionFailedEventAttributes: {
          initiatedEventId: '4',
        },
      }),
      event(15, {
        workflowTaskFailedEventAttributes: { scheduledEventId: '14' },
      }),
      event(16, {
        workflowTaskTimedOutEventAttributes: { scheduledEventId: '15' },
      }),
    ];
    scan.append(events.slice(0, 5));
    expect(summarizeRunWork(scan.snapshot(run(), false)).totals.total).toBe(4);
    scan.append(events.slice(5, 10));
    scan.append(events.slice(10));
    scan.append(events);
    const result = summarizeRunWork(scan.snapshot(run(), true));
    expect(
      Object.fromEntries(
        result.primitives.map((p) => [p.kind, p.counts.total]),
      ),
    ).toEqual({
      'child-workflow': 1,
      update: 1,
      nexus: 1,
      signal: 2,
      'local-activity': 1,
      other: 1,
    });
    expect(result.totals).toMatchObject({
      total: 7,
      completed: 4,
      failed: 2,
      timedOut: 1,
      active: 0,
    });
    expect(result.taskFailures).toBe(2);
    expect(runAttention(result, 'Continued as new')).toMatchObject({
      trouble: true,
      label: '5 issues',
    });
    expect(scan.retainedSteps).toBe(0);
    expect(scan.scannedEvents).toBe(16);
  });

  it('keeps cancellations distinct from failures and releases their metadata', () => {
    const scan = new RunSummaryAccumulator();
    scan.append([
      event(1, {
        requestCancelExternalWorkflowExecutionInitiatedEventAttributes: {},
      }),
      event(2, {
        externalWorkflowExecutionCancelRequestedEventAttributes: {
          initiatedEventId: '1',
        },
      }),
      event(3, {
        nexusOperationCancelRequestedEventAttributes: {
          scheduledEventId: '40',
        },
      }),
      event(4, {
        nexusOperationCancelRequestFailedEventAttributes: {
          scheduledEventId: '40',
        },
      }),
      event(5, { startChildWorkflowExecutionInitiatedEventAttributes: {} }),
      event(6, {
        childWorkflowExecutionCanceledEventAttributes: {
          initiatedEventId: '5',
        },
      }),
    ]);
    const result = summarizeRunWork(scan.snapshot(run(), true));
    expect(result.totals).toMatchObject({
      total: 3,
      completed: 1,
      failed: 1,
      canceled: 1,
    });
    expect(scan.retainedSteps).toBe(0);
  });

  it('does not count an unfinished child as interrupted before the full history loads', () => {
    const scan = new RunSummaryAccumulator();
    scan.append([
      event(1, { startChildWorkflowExecutionInitiatedEventAttributes: {} }),
    ]);
    expect(summarizeRunWork(scan.snapshot(run(), false)).totals).toMatchObject({
      active: 1,
      interrupted: 0,
    });
    expect(summarizeRunWork(scan.snapshot(run(), true)).totals).toMatchObject({
      active: 0,
      interrupted: 1,
    });
  });

  it('uses complete closed runs for workload baselines and preserves partial lower bounds', () => {
    const runs = [
      run('a'),
      run('b'),
      run('c'),
      run('d', 90_000),
      { ...run('e'), closeTime: undefined, status: 'Running' },
    ];
    const summary = (id: string, count: number, complete = true) =>
      summarizeSteps(
        id,
        Array.from({ length: count }, (_, i) => ({
          id: String(i),
          name: 'work',
          kind: 'activity' as const,
          startTime: 0,
          closeTime: 1,
          status: 'Completed',
          lane: 0,
        })),
        complete,
      );
    const summaries = {
      a: summary('a', 10),
      b: summary('b', 10),
      c: summary('c', 10),
      d: summary('d', 40),
      e: summary('e', 1, false),
    };
    const result = compareRuns(runs, summaries, 120_000);
    expect(result).toMatchObject({
      durationMedian: 30_000,
      workMedian: 10,
      maxWork: 40,
      maxDuration: 120_000,
    });
    expect(result.rows[3]).toMatchObject({ longer: true, heavier: true });
    expect(result.rows[4]).toMatchObject({ longer: true, heavier: false });
    expect(
      compareRuns(runs.slice(0, 2), summaries, 120_000).durationMedian,
    ).toBeUndefined();
    expect(
      compareRuns(runs, { ...summaries, e: summary('e', 100, false) }, 120_000)
        .maxWork,
    ).toBe(40);
    expect(
      compareRuns(runs.slice(4), { e: summary('e', 5, false) }, 120_000)
        .maxWork,
    ).toBe(5);
  });
});
