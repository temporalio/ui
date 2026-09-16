import type {
  EventGroup,
  EventGroups,
} from '$lib/models/event-groups/event-groups';
import { isEvent } from '$lib/models/event-history';
import type { EventSortOrder } from '$lib/stores/event-view';
import type {
  WorkflowEvent,
  WorkflowEventWithPending,
} from '$lib/types/events';
import { getGroupForEventOrPendingEvent } from '$lib/utilities/pending-activities';

export const isMiddleEvent = (
  event: WorkflowEvent,
  groups: EventGroups | Map<string, EventGroup>,
): boolean => {
  const group =
    groups instanceof Map
      ? groups.get(event.id)
      : groups.find((candidate) =>
          candidate.eventList.some((listEvent) => listEvent.id === event.id),
        );
  if (!group) return false;
  return (
    group.eventList.findIndex((listEvent) => listEvent.id === event.id) === 1 &&
    group.eventList.length === 3
  );
};

const pairIsConsecutive = (firstId: string, secondId: string): boolean => {
  return parseInt(firstId) === parseInt(secondId) - 1;
};

const isConsecutiveGroup = (group: EventGroup): boolean => {
  const { eventList } = group;
  if (eventList.length === 1) return true;
  if (eventList.length === 2)
    return pairIsConsecutive(eventList[0].id, eventList[1].id);
  if (eventList.length === 3) {
    return (
      pairIsConsecutive(eventList[0].id, eventList[1].id) &&
      pairIsConsecutive(eventList[1].id, eventList[2].id)
    );
  }
  return false;
};

const getOpenGroups = (
  event: WorkflowEventWithPending,
  groups: EventGroups,
): number => {
  const group = getGroupForEventOrPendingEvent(groups, event);
  if (!group) return 0;
  if (group.level !== undefined) return group.level;

  const pendingGroups = groups
    .filter((other) => other.isPending && other.id !== group.id)
    .filter(
      (other) =>
        parseInt(other.initialEvent.id) < parseInt(group.initialEvent.id),
    );

  const nonPendingGroups = groups
    .filter(
      (other) =>
        other.eventList.length > 1 && !other.isPending && other.id !== group.id,
    )
    .filter(
      (other) =>
        parseInt(other.initialEvent.id) < parseInt(group.initialEvent.id),
    )
    .filter(
      (other) => parseInt(other.lastEvent.id) > parseInt(group.initialEvent.id),
    );

  const openGroups = [...pendingGroups, ...nonPendingGroups];

  if (!openGroups.length && isConsecutiveGroup(group)) {
    group.level = 0;
  }
  group.level = openGroups.length + 1;
  return group.level;
};

export const getNextDistanceAndOffset = (
  history: WorkflowEventWithPending[],
  event: WorkflowEventWithPending,
  groups: EventGroups,
  height: number,
  sort: EventSortOrder,
): { nextDistance: number; offset: number } => {
  const group = getGroupForEventOrPendingEvent(groups, event);
  let nextDistance = 0;
  let offset = 0;

  if (!group) {
    return { nextDistance, offset };
  }

  if (group.eventList.length === 1 && !group.isPending) {
    return { nextDistance, offset };
  }

  const currentIndex = isEvent(event) ? group.eventList.indexOf(event) : -1;
  const nextEvent = isEvent(event)
    ? group.eventList[currentIndex + 1]
    : undefined;
  if (!isEvent(event) || event.category !== 'workflow') {
    offset = getOpenGroups(event, groups);
  }

  if (!nextEvent && !group.isPending) {
    return { nextDistance, offset };
  }

  let diff = 0;
  if (nextEvent && isEvent(event)) {
    diff = parseInt(nextEvent.id) - parseInt(event.id);
  } else if (group.isPending && isEvent(event)) {
    diff = history.length - parseInt(event.id) + 2;
  }
  const distance = diff * height;
  nextDistance = sort === 'ascending' ? distance : -distance;
  return { nextDistance, offset };
};
