import type { ChainRun, ChainStep } from './run-chain';
import {
  emptyCounts,
  type RunSummary,
  type StepCounts,
} from './run-chain-summary';

export const primitiveLabels: Record<ChainStep['kind'], string> = {
  activity: 'Activities',
  'local-activity': 'Local activities',
  'child-workflow': 'Child workflows',
  timer: 'Timers',
  signal: 'Signals sent / received',
  update: 'Updates',
  nexus: 'Nexus operations',
  other: 'Markers / other commands',
};

export function summarizeRunWork(summary?: RunSummary) {
  const kinds = new Map<ChainStep['kind'], StepCounts>();
  const totals = emptyCounts();
  for (const group of Object.values(summary?.groups ?? {})) {
    const counts = kinds.get(group.kind) ?? emptyCounts();
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
    ] as const) {
      counts[field] += group.counts[field];
      totals[field] += group.counts[field];
    }
    kinds.set(group.kind, counts);
  }
  const primitives = (Object.keys(primitiveLabels) as ChainStep['kind'][])
    .filter((kind) => kinds.has(kind))
    .map((kind) => ({
      kind,
      label: primitiveLabels[kind],
      counts: kinds.get(kind)!,
    }));
  return { totals, primitives, taskFailures: summary?.taskFailures ?? 0 };
}

function median(values: number[]) {
  if (values.length < 3) return undefined;
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2
    ? ordered[middle]
    : (ordered[middle - 1] + ordered[middle]) / 2;
}

/** Compare only the displayed runs. Partial histories never lower the baseline. */
export function compareRuns(
  runs: ChainRun[],
  summaries: Record<string, RunSummary>,
  now: number,
) {
  const rows = runs.map((run) => ({
    run,
    summary: summaries[run.runId],
    duration: Math.max(0, (run.closeTime ?? now) - run.startTime),
    ...summarizeRunWork(summaries[run.runId]),
  }));
  const durationMedian = median(
    rows
      .filter((row) => row.run.closeTime !== undefined)
      .map((row) => row.duration),
  );
  const workMedian = median(
    rows
      .filter((row) => row.run.closeTime !== undefined && row.summary?.complete)
      .map((row) => row.totals.total),
  );
  return {
    maxDuration: Math.max(1, ...rows.map((row) => row.duration)),
    maxWork: Math.max(1, ...rows.map((row) => row.totals.total)),
    durationMedian,
    workMedian,
    rows: rows.map((row) => ({
      ...row,
      longer:
        durationMedian !== undefined &&
        durationMedian > 0 &&
        row.duration >= durationMedian * 1.5,
      heavier:
        !!row.summary?.complete &&
        workMedian !== undefined &&
        row.totals.total > workMedian &&
        row.totals.total >= workMedian * 1.5,
    })),
  };
}

export function runAttention(
  row: ReturnType<typeof summarizeRunWork>,
  status: string,
) {
  const { totals, taskFailures } = row;
  const problems = [
    totals.failed && `${totals.failed} failed`,
    totals.timedOut && `${totals.timedOut} timed out`,
    taskFailures && `${taskFailures} workflow task failures / timeouts`,
  ].filter(Boolean);
  const issueCount = totals.failed + totals.timedOut + taskFailures;
  const closedBadly = [
    'Failed',
    'Timed out',
    'Terminated',
    'Canceled',
  ].includes(status);
  return {
    label: closedBadly
      ? status
      : problems.length === 1
        ? String(problems[0]).replace(
            'workflow task failures / timeouts',
            'task errors',
          )
        : issueCount
          ? `${issueCount} issues`
          : totals.canceled
            ? `${totals.canceled} canceled`
            : totals.interrupted
              ? `${totals.interrupted} open at close`
              : '',
    title: [
      closedBadly && `Workflow ${status.toLowerCase()}`,
      ...problems,
      totals.canceled && `${totals.canceled} canceled`,
      totals.interrupted &&
        `${totals.interrupted} operations still open when this run closed`,
    ]
      .filter(Boolean)
      .join(' · '),
    trouble:
      issueCount > 0 || ['Failed', 'Timed out', 'Terminated'].includes(status),
  };
}
