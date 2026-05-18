import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import { maxDate, validTimeToDate } from '$lib/utilities/format-time';

import type { TimeSegment } from './types';
import { Timespan } from '../timespan';

function getGroupStartMs(group: EventGroup): number {
  return validTimeToDate(group.initialEvent.eventTime).getTime();
}

function getGroupEndMs(group: EventGroup, pendingTimestampMs: number): number {
  if (group.isPending) {
    return maxDate(pendingTimestampMs, group.lastEvent.eventTime).getTime();
  }

  return validTimeToDate(group.lastEvent.eventTime).getTime();
}

export function buildTimeSegments({
  workflowTimespan,
  eventGroups,
}: {
  workflowTimespan: Timespan;
  eventGroups: EventGroups;
}): TimeSegment[] {
  const sortedGroupTimespans: Timespan[] = eventGroups
    .map((group) => {
      return new Timespan(
        getGroupStartMs(group),
        getGroupEndMs(group, workflowTimespan.endTimeMs),
      );
    })
    .sort((a, b) => a.startTimeMs - b.startTimeMs);

  const timeSegments: TimeSegment[] = [];

  let cursorMs: number = workflowTimespan.startTimeMs;

  for (const groupTimespan of sortedGroupTimespans) {
    const groupStart = workflowTimespan.clamp(groupTimespan.startTimeMs);
    const groupEnd = workflowTimespan.clamp(groupTimespan.endTimeMs);

    if (groupEnd <= groupStart) continue;

    const currentSegment = timeSegments.at(-1);

    if (
      currentSegment?.kind === 'active' &&
      groupStart <= currentSegment.timespan.endTimeMs
    ) {
      // Overlapping or touching the current active span → extend if needed
      if (groupEnd > currentSegment.timespan.endTimeMs) {
        currentSegment.timespan = new Timespan(
          currentSegment.timespan.startTimeMs,
          groupEnd,
        );
        cursorMs = groupEnd;
      }
      continue;
    }

    if (cursorMs < groupStart) {
      timeSegments.push({
        kind: 'inactive',
        timespan: new Timespan(cursorMs, groupStart),
      });
    }

    timeSegments.push({
      kind: 'active',
      timespan: new Timespan(groupStart, groupEnd),
    });

    cursorMs = groupEnd;
  }

  if (cursorMs < workflowTimespan.endTimeMs) {
    timeSegments.push({
      kind: 'inactive',
      timespan: new Timespan(cursorMs, workflowTimespan.endTimeMs),
    });
  }

  return timeSegments;
}
