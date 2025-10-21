import type { WorkflowExecution } from '$lib/types/workflows';

export const isWorkflowTaskFailure = (workflow: WorkflowExecution): boolean => {
  if (!workflow.searchAttributes || workflow.status !== 'Running') {
    return false;
  }

  const taskFailureProblems = {
    TemporalReportedProblems: [
      'category=WorkflowTaskFailed',
      'cause=WorkflowTaskFailedCauseUnspecified',
    ],
  };

  const reportedProblems =
    workflow.searchAttributes?.indexedFields?.['TemporalReportedProblems'] ||
    [];

  // This is not ideal and poorly typed -> Reference TASK_FAILURES_QUERY
  return reportedProblems.every((problem) =>
    taskFailureProblems.TemporalReportedProblems.includes(problem),
  );
};
