import type { WorkflowStatus } from '$lib/types/workflows';

export type WorkflowStatuses = readonly WorkflowStatus[];
export type WorkflowFilters = readonly (WorkflowStatus | 'All')[];

export const workflowStatuses: WorkflowStatuses = [
  'Running',
  'TimedOut',
  'Completed',
  'Failed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
] as const;

export const workflowStatusFilters: WorkflowFilters = [
  'All',
  ...workflowStatuses,
] as const;
