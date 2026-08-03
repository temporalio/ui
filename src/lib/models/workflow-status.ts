import type { WorkflowStatus } from '$lib/types/workflows';

export type WorkflowFilters = readonly (WorkflowStatus | 'All')[];

export const workflowStatuses: readonly WorkflowStatus[] = [
  'Running',
  'Paused',
  'TimedOut',
  'Completed',
  'Failed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
] as const;

export function isWorkflowStatusType(
  value: string,
): value is NonNullable<WorkflowStatus> {
  return workflowStatuses.includes(value as WorkflowStatus);
}

export const workflowStatusFilters: WorkflowFilters = [
  'All',
  ...workflowStatuses,
] as const;
