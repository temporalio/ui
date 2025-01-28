import { get, writable } from 'svelte/store';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
import { isPendingActivity } from '$lib/utilities/is-pending-activity';

export const indexPageSize = 200;
export const startIndex = writable(0);
export const endIndex = writable(indexPageSize);

export const activeEvents = writable<string[]>([]);
export const activeGroups = writable<string[]>([]);

export const clearActives = () => {
  activeGroups.set([]);
  activeEvents.set([]);
  startIndex.set(0);
  endIndex.set(indexPageSize);
};

export const clearActiveEvents = () => {
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

export const setSingleActiveEvent = (event: WorkflowEvent) => {
  activeGroups.set([]);
  if (!get(activeEvents).includes(event.id)) {
    activeEvents.set([event.id]);
  } else {
    activeEvents.set([]);
  }
};

export const setActiveEvent = (
  event: WorkflowEvent | PendingActivity,
  group: EventGroup,
) => {
  activeGroups.set([]);

  if (isPendingActivity(event)) {
    activeEvents.set(get(activeEvents).filter((id) => id !== event.activityId));
    return;
  }

  if (!get(activeEvents).includes(event.id)) {
    const activeEventInGroup = get(activeEvents).find((id) =>
      group?.eventIds.has(id),
    );
    if (activeEventInGroup) {
      activeEvents.set([
        ...get(activeEvents).filter((id) => id !== activeEventInGroup),
        event.id,
      ]);
    } else {
      activeEvents.set([...get(activeEvents), event.id]);
    }
  } else {
    activeEvents.set(get(activeEvents).filter((id) => id !== event.id));
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
