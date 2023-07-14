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

export function isWorkflowStatusType(value: string): value is WorkflowStatus {
  return [
    'Running',
    'TimedOut',
    'Completed',
    'Failed',
    'ContinuedAsNew',
    'Canceled',
    'Terminated',
  ].includes(value);
}

export const workflowStatusFilters: WorkflowFilters = [
  'All',
  ...workflowStatuses,
] as const;
