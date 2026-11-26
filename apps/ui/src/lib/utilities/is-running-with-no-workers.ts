import type { WorkflowRunWithWorkers } from '$lib/stores/workflow-run';

export function isRunningWithNoWorkers(
  workflowRun: WorkflowRunWithWorkers,
): boolean {
  const { workflow, workers, workersLoaded } = workflowRun;
  const isPending = workflow?.isRunning || workflow?.isPaused;
  return Boolean(workersLoaded && isPending && !workers?.pollers?.length);
}
