import type { ScheduleListEntry } from '$lib/types';

import type { ResolvedScheduledActionListEntry } from './types';
import { isWorkflowScheduleListEntry } from './workflow/action';

export function resolveScheduledActionListEntry(
  schedule: ScheduleListEntry,
): ResolvedScheduledActionListEntry {
  if (isWorkflowScheduleListEntry(schedule)) {
    return { type: 'workflow', schedule };
  }

  return { type: 'unknown', schedule };
}
