import type { WorkflowStatus } from '$lib/types/workflows';

export type WorkflowStatuses = Record<WorkflowStatus, string>;
export type WorkflowFilters = WorkflowStatuses & { All: 'All' };

export const workflowStatuses: WorkflowStatuses = {
  Running: 'Running',
  TimedOut: 'Timed Out',
  Completed: 'Completed',
  Failed: 'Failed',
  ContinuedAsNew: 'Continued as New',
  Canceled: 'Canceled',
  Terminated: 'Terminated',
} as const;

export const workflowStatusFilters: WorkflowFilters = {
  ...workflowStatuses,
  All: 'All',
} as const;
