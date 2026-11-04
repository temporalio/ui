import type { ScheduleListEntry } from '$lib/types';

import { scheduledActionDefinitions } from './registry';
import type { ResolvedScheduledActionListEntry } from './types';

export function resolveScheduledActionListEntry(
  schedule: ScheduleListEntry,
): ResolvedScheduledActionListEntry {
  for (const definition of Object.values(scheduledActionDefinitions)) {
    const action = definition.resolveListEntry(schedule);
    if (action) {
      return action;
    }
  }

  return { type: 'unknown', schedule };
}
