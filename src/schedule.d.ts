// type WorkflowExecutionStatus = import('$types').WorkflowExecutionStatus;
// type ListWorkflowExecutionsResponse =
//   import('$types').ListWorkflowExecutionsResponse;

type SchedulePreset =
  | 'interval'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'string';
