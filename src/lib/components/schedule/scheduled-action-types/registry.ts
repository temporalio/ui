import type { DescribeFullSchedule } from '$lib/types/schedule';

import type {
  ResolvedScheduledAction,
  ScheduledActionDefinition,
  ScheduledActionResolution,
  ScheduledActionType,
} from './types';
import { workflowActionDefinition } from './workflow/definition';

export const DEFAULT_SCHEDULED_ACTION_TYPE: ScheduledActionType = 'workflow';

export const scheduledActionTypes: {
  [Type in ScheduledActionType]: ScheduledActionDefinition<Type>;
} = {
  workflow: workflowActionDefinition,
};

export function getScheduledActionCreateMode(
  type: ScheduledActionType = DEFAULT_SCHEDULED_ACTION_TYPE,
): Extract<ResolvedScheduledAction, { isEditing: false }> {
  return { type, isEditing: false, schedule: null };
}

export function resolveScheduledAction(
  schedule: DescribeFullSchedule,
): ScheduledActionResolution<
  Extract<ResolvedScheduledAction, { isEditing: true }>
> {
  for (const definition of Object.values(scheduledActionTypes)) {
    const resolvedAction = definition.resolve(schedule);
    if (resolvedAction) return { status: 'known', action: resolvedAction };
  }

  return { status: 'unknown', schedule };
}
