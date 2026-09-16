import type { WorkflowEvent } from '$lib/types/events';

import type { EventGroup, EventGroups } from './event-groups';

export const buildGroupIndex = (
  groups: EventGroups,
): Map<string, EventGroup> => {
  const index = new Map<string, EventGroup>();
  for (const group of groups) {
    for (const event of group.eventList) {
      index.set(event.id, group);
    }
  }
  return index;
};

export const getGroupForEvent = (
  event: WorkflowEvent,
  groupsOrIndex: EventGroups | Map<string, EventGroup>,
): EventGroup | undefined => {
  if (groupsOrIndex instanceof Map) return groupsOrIndex.get(event.id);
  for (const group of groupsOrIndex) {
    if (group.eventList.some((e) => e.id === event.id)) return group;
  }
};
