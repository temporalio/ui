import type { DescribeFullSchedule } from '$lib/types/schedule';

import type {
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

export function resolveScheduledAction(
  schedule: DescribeFullSchedule | null,
  selectedType: ScheduledActionType = DEFAULT_SCHEDULED_ACTION_TYPE,
): ScheduledActionResolution {
  if (!schedule) {
    return {
      status: 'known',
      action: scheduledActionTypes[selectedType].resolve(null),
    };
  }

  for (const definition of Object.values(scheduledActionTypes)) {
    const resolvedAction = definition.resolve(schedule);
    if (resolvedAction) return { status: 'known', action: resolvedAction };
  }

  return { status: 'unknown', schedule };
}
