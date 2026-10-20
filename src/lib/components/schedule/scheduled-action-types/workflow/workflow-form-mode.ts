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
  schedule: DescribeFullSchedule | null,
): ResolvedWorkflowAction | null {
  const mode = getWorkflowFormMode(schedule);
  return mode ? { type: 'workflow', ...mode } : null;
}
