import type { WorkflowExecution } from '$lib/types/workflows';
import { isFuture } from '$lib/utilities/format-date';

export const isWorkflowDelayed = (workflow: WorkflowExecution): boolean => {
  return !!workflow.executionTime && isFuture(workflow.executionTime);
};
