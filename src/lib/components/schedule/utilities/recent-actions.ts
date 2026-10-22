import type { ScheduleActionResult } from '$lib/types';
import { getEpochMilliseconds } from '$lib/utilities/format-time';

export function getRecentScheduleActions(
  recentActions: ScheduleActionResult[],
  limit = 5,
): ScheduleActionResult[] {
  return [...recentActions]
    .sort(
      (a, b) =>
        getEpochMilliseconds(b.actualTime) - getEpochMilliseconds(a.actualTime),
    )
    .slice(0, limit);
}
