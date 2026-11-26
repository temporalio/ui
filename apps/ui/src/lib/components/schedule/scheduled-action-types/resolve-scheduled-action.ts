import type { DescribeFullSchedule } from '$lib/types/schedule';

import { scheduledActionDefinitions } from './registry';
import type { ResolvedScheduledAction, ScheduledActionType } from './types';

export const DEFAULT_SCHEDULED_ACTION_TYPE: ScheduledActionType = 'workflow';

export function resolveScheduledAction(
  schedule: DescribeFullSchedule | null,
  selectedType: ScheduledActionType = DEFAULT_SCHEDULED_ACTION_TYPE,
): ResolvedScheduledAction {
  if (!schedule) {
    return scheduledActionDefinitions[selectedType].createAction();
  }

  for (const definition of Object.values(scheduledActionDefinitions)) {
    const action = definition.resolveSchedule(schedule);
    if (action) {
      return action;
    }
  }

  return { type: 'unknown', schedule };
}
