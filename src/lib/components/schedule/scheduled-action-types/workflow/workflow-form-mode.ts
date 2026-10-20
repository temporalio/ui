import type { DescribeFullSchedule } from '$lib/types/schedule';

import type { ActionFormMode } from '../types';
import type { ResolvedWorkflowAction, WorkflowSchedule } from './types';

export function isWorkflowSchedule(
  schedule: DescribeFullSchedule,
): schedule is WorkflowSchedule {
  return schedule.schedule?.action?.startWorkflow != null;
}

export function getWorkflowFormMode(
  schedule: DescribeFullSchedule | null,
): ActionFormMode<WorkflowSchedule> | null {
  if (!schedule) return { isEditing: false, schedule: null };
  if (!isWorkflowSchedule(schedule)) return null;

  return { isEditing: true, schedule };
}

export function resolveWorkflowAction(
  schedule: null,
): Extract<ResolvedWorkflowAction, { isEditing: false }>;
export function resolveWorkflowAction(
  schedule: DescribeFullSchedule,
): Extract<ResolvedWorkflowAction, { isEditing: true }> | null;
export function resolveWorkflowAction(
  schedule: DescribeFullSchedule | null,
): ResolvedWorkflowAction | null {
  if (!schedule) return { type: 'workflow', isEditing: false, schedule: null };
  if (!isWorkflowSchedule(schedule)) return null;

  return { type: 'workflow', isEditing: true, schedule };
}
