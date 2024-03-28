import { get, writable } from 'svelte/store';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvent } from '$lib/types/events';

export const activeEvents = writable<string[]>([]);
export const activeGroups = writable<string[]>([]);

export const clearActives = () => {
  activeGroups.set([]);
  activeEvents.set([]);
};

export const setActiveGroup = (group: EventGroup) => {
  activeEvents.set([]);
  if (!get(activeGroups).includes(group.id)) {
    activeGroups.set([...get(activeGroups), group.id]);
  } else {
    activeGroups.set(get(activeGroups).filter((id) => id !== group.id));
  }
};

export const setSingleActiveGroup = (group: EventGroup) => {
  activeEvents.set([]);
  if (!get(activeGroups).includes(group.id)) {
    activeGroups.set([group.id]);
  } else {
    activeGroups.set([]);
  }
};

export const setActiveGroupAndEvent = (
  group: EventGroup,
  event: WorkflowEvent,
) => {
  if (group) {
    if (!get(activeGroups).includes(group.id)) {
      activeGroups.set([...get(activeGroups), group.id]);
    } else {
      activeGroups.set(get(activeGroups).filter((id) => id !== group.id));
    }
  }

  if (event) {
    if (!get(activeEvents).includes(event.id)) {
      activeEvents.set([...get(activeEvents), event.id]);
    } else {
      activeEvents.set(get(activeGroups).filter((id) => id !== event.id));
    }
  }
};
