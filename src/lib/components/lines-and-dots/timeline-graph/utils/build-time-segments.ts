import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import { maxDate, validTimeToDate } from '$lib/utilities/format-time';
import { isNotNullish, isNullish } from '$lib/utilities/type-predicates';

import { Timespan } from '../timespan';
import type { TimeSegment } from '../types';

function getGroupStartMs(group: EventGroup): number | null {
  const { eventTime } = group.initialEvent;

  if (isNullish(eventTime)) {
    return null;
  }

  return validTimeToDate(eventTime).getTime();
}

function getGroupEndMs(group: EventGroup, pendingTimestampMs: number): number {
  const { eventTime } = group.lastEvent;

  if (isNullish(eventTime)) {
    return pendingTimestampMs;
  }

  if (group.isPending) {
    return maxDate(pendingTimestampMs, eventTime).getTime();
  }

  return validTimeToDate(eventTime).getTime();
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
      const startMs = getGroupStartMs(group);
      if (isNullish(startMs)) {
        return null;
      }

      return new Timespan(
        startMs,
        getGroupEndMs(group, workflowTimespan.endTimeMs),
      );
    })
    .filter(isNotNullish)
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
      timespan: new Timespan(cursorMs, workflowTimespan.endTimeMs, {
        endUnbounded: workflowTimespan.endUnbounded,
      }),
    });
  }

  return timeSegments;
}
