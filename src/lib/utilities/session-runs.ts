import type { CompareStep } from '$lib/utilities/compare-runs';

export type SessionRun = {
  runId: string;
  status: string;
  startTime: string;
  endTime: string;
  steps: CompareStep[];
};

export type SessionSummary = {
  workflowId: string;
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  totalDurationMs: number;
  totalSteps: number;
  modelsUsed: string[];
};

export const computeSessionSummary = (
  workflowId: string,
  runs: SessionRun[],
): SessionSummary => {
  const allSteps = runs.flatMap((r) => r.steps);
  const modelsUsed = [
    ...new Set(
      allSteps.map((s) => s.model).filter((m): m is string => m !== undefined),
    ),
  ];

  const firstStart = runs.length ? new Date(runs[0].startTime).getTime() : 0;
  const lastEnd = runs.length
    ? new Date(runs[runs.length - 1].endTime).getTime()
    : 0;

  return {
    workflowId,
    totalRuns: runs.length,
    totalTokens: allSteps.reduce((sum, s) => sum + (s.totalTokens ?? 0), 0),
    totalCost: allSteps.reduce((sum, s) => sum + (s.llmMetadata?.cost ?? 0), 0),
    totalDurationMs: lastEnd - firstStart,
    totalSteps: allSteps.length,
    modelsUsed,
  };
};
