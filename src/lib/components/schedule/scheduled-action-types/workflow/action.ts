import type { DescribeFullSchedule } from '$lib/types/schedule';

import type { ResolvedWorkflowAction, WorkflowSchedule } from './types';

export function isWorkflowSchedule(
  schedule: DescribeFullSchedule,
): schedule is WorkflowSchedule {
  return schedule.schedule?.action?.startWorkflow != null;
}

export function resolveWorkflowAction(
  schedule: DescribeFullSchedule,
): ResolvedWorkflowAction | null {
  if (!isWorkflowSchedule(schedule)) return null;

  return { type: 'workflow', schedule };
}
