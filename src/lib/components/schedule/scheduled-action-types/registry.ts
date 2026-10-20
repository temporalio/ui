import type { DescribeFullSchedule } from '$lib/types/schedule';

import type {
  ResolvedScheduledAction,
  ScheduledActionDefinition,
  ScheduledActionType,
} from './types';
import { workflowActionDefinition } from './workflow/definition';

export const DEFAULT_SCHEDULED_ACTION_TYPE: ScheduledActionType = 'workflow';

export const scheduledActionTypes: Record<
  ScheduledActionType,
  ScheduledActionDefinition
> = {
  workflow: workflowActionDefinition,
};

export function resolveScheduledAction(
  schedule: DescribeFullSchedule | null,
  selectedType: ScheduledActionType = DEFAULT_SCHEDULED_ACTION_TYPE,
): ResolvedScheduledAction | null {
  if (!schedule) return scheduledActionTypes[selectedType].resolve(null);

  for (const definition of Object.values(scheduledActionTypes)) {
    const resolvedAction = definition.resolve(schedule);
    if (resolvedAction) return resolvedAction;
  }

  return null;
}
