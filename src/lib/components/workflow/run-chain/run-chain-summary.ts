import type { HistoryEvent } from '$lib/types/events';

import {
  type ChainRun,
  type ChainStep,
  finishChainSteps,
  type LiveRunState,
  updateChainSteps,
} from './run-chain';

export type StepCounts = {
  total: number;
  completed: number;
  failed: number;
  timedOut: number;
  canceled: number;
  interrupted: number;
  active: number;
  retried: number;
  recovered: number;
  durationTotal: number;
  durationMin?: number;
  durationMax?: number;
};
export type StepSummary = {
  key: string;
  name: string;
  kind: ChainStep['kind'];
  counts: StepCounts;
};
export type RunSummary = {
  runId: string;
  groups: Record<string, StepSummary>;
  complete: boolean;
  scannedEvents: number;
  otherEvents: number;
  taskFailures: number;
};
export const emptyCounts = (): StepCounts => ({
  total: 0,
  completed: 0,
  failed: 0,
  timedOut: 0,
  canceled: 0,
  interrupted: 0,
  active: 0,
  retried: 0,
  recovered: 0,
  durationTotal: 0,
});
export const stepSummaryKey = (step: Pick<ChainStep, 'kind' | 'name'>) =>
  JSON.stringify([step.kind, step.kind === 'timer' ? 'Timers' : step.name]);

export function addStep(counts: StepCounts, step: ChainStep) {
  counts.total++;
  if (step.status === 'Completed') counts.completed++;
  else if (step.status === 'Failed' || step.status === 'Terminated')
    counts.failed++;
  else if (step.status === 'Timed out') counts.timedOut++;
  else if (step.status === 'Canceled') counts.canceled++;
  else if (step.status === 'Interrupted') counts.interrupted++;
  else counts.active++;
  if ((step.attempts ?? 1) > 1) {
    counts.retried++;
    if (step.status === 'Completed') counts.recovered++;
  }
  if (step.closeTime !== undefined) {
    const duration = Math.max(0, step.closeTime - step.startTime);
    counts.durationTotal += duration;
    counts.durationMin = Math.min(counts.durationMin ?? Infinity, duration);
    counts.durationMax = Math.max(counts.durationMax ?? 0, duration);
  }
}

export function summarizeSteps(
  runId: string,
  steps: ChainStep[],
  complete: boolean,
  scannedEvents = 0,
): RunSummary {
  const summary: RunSummary = {
    runId,
    groups: {},
    complete,
    scannedEvents,
    otherEvents: 0,
    taskFailures: 0,
  };
  for (const step of steps) {
    const key = stepSummaryKey(step);
    const group = (summary.groups[key] ??= {
      key,
      name: step.kind === 'timer' ? 'Timers' : step.name,
      kind: step.kind,
      counts: emptyCounts(),
    });
    addStep(group.counts, step);
  }
  return summary;
}

export function aggregateChainCell(
  runs: ChainRun[],
  key: string,
  summaries: Record<string, RunSummary>,
) {
  const counts = emptyCounts();
  let observedRuns = 0,
    absentRuns = 0,
    unknownRuns = 0;
  const failedRuns: ChainRun[] = [],
    retriedRuns: ChainRun[] = [],
    activeRuns: ChainRun[] = [];
  for (const run of runs) {
    const summary = summaries[run.runId];
    const source = summary?.groups[key]?.counts;
    if (!summary?.complete) unknownRuns++;
    if (!source) {
      if (summary?.complete) absentRuns++;
      continue;
    }
    observedRuns++;
    if (source.failed + source.timedOut + source.canceled + source.interrupted)
      failedRuns.push(run);
    if (source.retried) retriedRuns.push(run);
    if (source.active) activeRuns.push(run);
    for (const field of [
      'total',
      'completed',
      'failed',
      'timedOut',
      'canceled',
      'interrupted',
      'active',
      'retried',
      'recovered',
      'durationTotal',
    ] as const)
      counts[field] += source[field];
    if (source.durationMin !== undefined)
      counts.durationMin = Math.min(
        counts.durationMin ?? Infinity,
        source.durationMin,
      );
    if (source.durationMax !== undefined)
      counts.durationMax = Math.max(
        counts.durationMax ?? 0,
        source.durationMax,
      );
  }
  return {
    counts,
    observedRuns,
    absentRuns,
    unknownRuns,
    failedRuns,
    retriedRuns,
    activeRuns,
    runCount: runs.length,
  };
}

/** Streaming overview: completed steps become counters and their metadata is released. */
export class RunSummaryAccumulator {
  private pending = new Map<string, ChainStep>();
  private groups: Record<string, StepSummary> = {};
  lastEventId = 0;
  scannedEvents = 0;
  otherEvents = 0;
  taskFailures = 0;

  get retainedSteps() {
    return this.pending.size;
  }

  append(events: HistoryEvent[]) {
    const fresh = events.filter(
      (event) => Number(event.eventId) > this.lastEventId,
    );
    if (!fresh.length) return;
    updateChainSteps(this.pending, fresh);
    for (const [id, step] of this.pending) {
      if (step.closeTime === undefined) continue;
      this.add(this.groups, step);
      this.pending.delete(id);
    }
    this.lastEventId = Number(fresh.at(-1)!.eventId);
    this.scannedEvents += fresh.length;
    this.taskFailures += fresh.filter(
      (event) =>
        event.workflowTaskFailedEventAttributes ||
        event.workflowTaskTimedOutEventAttributes,
    ).length;
    this.otherEvents += fresh.filter(
      (event) =>
        !Object.keys(event).some((key) =>
          /^(activityTask|timer|workflowTask|workflowExecution).*EventAttributes$/.test(
            key,
          ),
        ),
    ).length;
  }

  private add(groups: Record<string, StepSummary>, step: ChainStep) {
    const key = stepSummaryKey(step);
    const group = (groups[key] ??= {
      key,
      name: step.kind === 'timer' ? 'Timers' : step.name,
      kind: step.kind,
      counts: emptyCounts(),
    });
    addStep(group.counts, step);
  }

  snapshot(run: ChainRun, complete: boolean, live?: LiveRunState): RunSummary {
    const groups = Object.fromEntries(
      Object.entries(this.groups).map(([key, group]) => [
        key,
        { ...group, counts: { ...group.counts } },
      ]),
    );
    // A closed run can still have unread completion events. Only mark an open
    // span interrupted after scanning the entire history.
    const state = complete ? run : { ...run, closeTime: undefined };
    for (const step of finishChainSteps(
      [...this.pending.values()].map((step) => ({ ...step })),
      state,
      live,
    ))
      this.add(groups, step);
    return {
      runId: run.runId,
      groups,
      complete,
      scannedEvents: this.scannedEvents,
      otherEvents: this.otherEvents,
      taskFailures: this.taskFailures,
    };
  }
}
