import type { WorkflowEvent } from '$lib/types/events';

import type { EventGroup, EventGroups } from './event-groups';

export const getGroupForEvent = (
  event: WorkflowEvent,
  groups: EventGroups,
): EventGroup => {
  const eventId = event.id;

  for (const group of groups) {
    if (group.eventList.some((e) => e.id === eventId)) return group;
  }
};
