import type { WorkflowExecution } from '$lib/types/workflows';

export const isWorkflowDelayed = (workflow: WorkflowExecution): boolean => {
  return (
    !!workflow.executionTime &&
    new Date(workflow.executionTime).getTime() > Date.now()
  );
};
