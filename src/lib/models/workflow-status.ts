import type { WorkflowStatus } from '$lib/types/workflows';

export type WorkflowFilters = readonly (WorkflowStatus | 'All')[];

export const workflowStatuses: readonly WorkflowStatus[] = [
  'Running',
  'TimedOut',
  'Completed',
  'Failed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
] as const;

export function isWorkflowStatusType(value: string): value is WorkflowStatus {
  return workflowStatuses.includes(value as WorkflowStatus);
}

export const workflowStatusFilters: WorkflowFilters = [
  'All',
  ...workflowStatuses,
] as const;
