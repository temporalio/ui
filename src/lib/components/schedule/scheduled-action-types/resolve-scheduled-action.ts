import type { DescribeFullSchedule } from '$lib/types/schedule';

import type {
  ResolvedScheduledAction,
  ScheduledActionType,
  SupportedScheduledAction,
} from './types';
import { resolveWorkflowAction } from './workflow/action';

export const DEFAULT_SCHEDULED_ACTION_TYPE: ScheduledActionType = 'workflow';

function getNewScheduledAction(
  type: ScheduledActionType = DEFAULT_SCHEDULED_ACTION_TYPE,
): SupportedScheduledAction {
  return { type, schedule: null };
}

export function resolveScheduledAction(
  schedule: DescribeFullSchedule | null,
  selectedType: ScheduledActionType = DEFAULT_SCHEDULED_ACTION_TYPE,
): ResolvedScheduledAction {
  if (!schedule) return getNewScheduledAction(selectedType);

  const workflowAction = resolveWorkflowAction(schedule);
  if (workflowAction) return workflowAction;

  return { type: 'unknown', schedule };
}
