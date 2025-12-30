import type { WorkflowExecution } from '$lib/types/workflows';

export const TemporalReportedProblems = [
  'category=WorkflowTaskFailed',
  'category=WorkflowTaskTimedOut',
];

export const TASK_FAILURES_QUERY =
  '`ExecutionStatus`="Running" AND `TemporalReportedProblems` IN ' +
  `(${TemporalReportedProblems.map((problem) => '"' + problem + '"').join(
    ', ',
  )})`;

export const isWorkflowTaskFailure = (workflow: WorkflowExecution): boolean => {
  if (!workflow.searchAttributes || workflow.status !== 'Running') return false;

  const reportedProblems = (workflow.searchAttributes?.indexedFields?.[
    'TemporalReportedProblems'
  ] || []) as unknown as string[];

  return reportedProblems.some((problem) =>
    TemporalReportedProblems.includes(problem),
  );
};
