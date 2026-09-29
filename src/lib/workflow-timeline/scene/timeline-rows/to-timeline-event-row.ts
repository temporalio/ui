import { getTimelineEventLabel } from './get-timeline-event-label';
import type { TimelineEventRow } from './types';
import type { QualifiedHistoryEvent } from '../../data/history-events/types';
import { compareEventIds, type EventKey } from '../../data/identity-keys';
import type { LifecycleGroup } from '../../data/lifecycle-groups/types';

function compareHistoryEvents(
  left: QualifiedHistoryEvent,
  right: QualifiedHistoryEvent,
): number {
  return compareEventIds(left.eventId, right.eventId);
}

/** Projects a lifecycle group into a renderable row when all events are available. */
export function toTimelineEventRow(
  lifecycleGroup: LifecycleGroup,
  getEvent: (eventKey: EventKey) => QualifiedHistoryEvent | undefined,
): TimelineEventRow | null {
  const events: QualifiedHistoryEvent[] = [];

  for (const eventKey of lifecycleGroup.eventKeys) {
    const event = getEvent(eventKey);

    if (!event) {
      return null;
    }

    events.push(event);
  }

  events.sort(compareHistoryEvents);

  const firstEvent = events[0];
  const lastEvent = events.at(-1);

  if (!firstEvent || !lastEvent) {
    return null;
  }

  return {
    rowKey: lifecycleGroup.lifecycleKey,
    executionKey: lifecycleGroup.executionKey,
    kind: lifecycleGroup.kind,
    label: getTimelineEventLabel(firstEvent),
    eventKeys: lifecycleGroup.eventKeys,
    startEventId: firstEvent.eventId,
    endEventId: lastEvent.eventId,
    startTimeMs: firstEvent.eventTimeMs,
    endTimeMs: lastEvent.eventTimeMs,
  };
}
