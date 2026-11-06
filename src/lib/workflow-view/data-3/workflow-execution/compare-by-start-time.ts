import type { WorkflowExecution } from './workflow-execution';

/** Compares executions by their start-event timestamps. */
export function compareWorkflowExecutionsByStartTime(
  left: WorkflowExecution,
  right: WorkflowExecution,
): number {
  return left.startEvent.eventTimeMs - right.startEvent.eventTimeMs;
}
