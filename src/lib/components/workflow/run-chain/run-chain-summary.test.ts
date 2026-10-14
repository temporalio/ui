import { describe, expect, it } from 'vitest';

import {
  makeActivityCompleted,
  makeActivityScheduled,
  makeActivityStarted,
  makeWorkflowCompleted,
} from '$lib/services/test-helpers/synthetic-events';

import type { ChainRun, ChainStep } from './run-chain';
import {
  aggregateChainCell,
  RunSummaryAccumulator,
  stepSummaryKey,
  summarizeSteps,
} from './run-chain-summary';
const run = (runId: string): ChainRun => ({
  runId,
  status: 'Continued as new',
  startTime: 0,
  closeTime: 10,
  eventCount: '10',
});
const step = (status: string): ChainStep => ({
  id: '2',
  name: 'processOrder',
  kind: 'activity',
  status,
  startTime: 1,
  closeTime: 5,
  lane: 0,
});
describe('chain summaries', () => {
  it('streams completions across pages, preserves retries, and releases completed metadata', () => {
    const scan = new RunSummaryAccumulator();
    const scheduled = makeActivityScheduled(2, 'work');
    const started = makeActivityStarted(3, 2);
    started.activityTaskStartedEventAttributes!.attempt = 4;
    scan.append([scheduled]);
    expect(scan.retainedSteps).toBe(1);
    // Partial history of a closed run must not invent an interruption.
    expect(
      Object.values(scan.snapshot(run('a'), false).groups)[0].counts,
    ).toMatchObject({ active: 1, interrupted: 0 });
    scan.append([started, makeActivityCompleted(4, 2, 3)]);
    expect(scan.retainedSteps).toBe(0);
    scan.append([started, makeActivityCompleted(4, 2, 3)]);
    const result = Object.values(scan.snapshot(run('a'), true).groups)[0];
    expect(result.counts).toMatchObject({
      total: 1,
      completed: 1,
      retried: 1,
      recovered: 1,
    });
    expect(scan.scannedEvents).toBe(3);
  });

  it('keeps counters instead of retaining thousands of completed steps', () => {
    const scan = new RunSummaryAccumulator();
    for (let index = 0; index < 2000; index++) {
      const id = index * 3 + 1;
      scan.append([
        makeActivityScheduled(id, 'work'),
        makeActivityStarted(id + 1, id),
        makeActivityCompleted(id + 2, id, id + 1),
      ]);
    }
    scan.append([makeWorkflowCompleted(6001)]);
    expect(scan.retainedSteps).toBe(0);
    const summary = scan.snapshot(run('large'), true);
    expect(Object.keys(summary.groups)).toHaveLength(1);
    expect(Object.values(summary.groups)[0].counts.completed).toBe(2000);
  });
  it('keeps mixed outcomes, occurrence counts, and distinct affected run counts', () => {
    const runs = [run('a'), run('b')];
    const summaries = {
      a: summarizeSteps(
        'a',
        [step('Completed'), step('Failed'), step('Failed')],
        true,
      ),
      b: summarizeSteps('b', [{ ...step('Completed'), attempts: 3 }], true),
    };
    const cell = aggregateChainCell(
      runs,
      stepSummaryKey(step('Completed')),
      summaries,
    );
    expect(cell.counts).toMatchObject({
      total: 4,
      completed: 2,
      failed: 2,
      retried: 1,
    });
    expect(cell.failedRuns.map((run) => run.runId)).toEqual(['a']);
    expect(cell.retriedRuns.map((run) => run.runId)).toEqual(['b']);
  });
  it('distinguishes missing history from work not observed in a fully scanned run', () => {
    const cell = aggregateChainCell([run('a'), run('b'), run('c')], 'missing', {
      a: summarizeSteps('a', [], true),
      b: summarizeSteps('b', [], false),
    });
    expect(cell).toMatchObject({
      absentRuns: 1,
      unknownRuns: 2,
      observedRuns: 0,
    });
  });
  it('groups repeated activities by type and timers by category without claiming step equivalence', () => {
    const summary = summarizeSteps(
      'a',
      [
        step('Completed'),
        { ...step('Completed'), id: '3' },
        { ...step('Completed'), kind: 'timer', name: 'Timer 12' },
        { ...step('Completed'), kind: 'timer', name: 'Timer 99' },
      ],
      true,
    );
    expect(
      Object.values(summary.groups).map((group) => [
        group.name,
        group.counts.total,
      ]),
    ).toEqual([
      ['processOrder', 2],
      ['Timers', 2],
    ]);
  });
});
