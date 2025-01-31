import { get, writable } from 'svelte/store';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

export const indexPageSize = 200;
export const startIndex = writable(0);
export const endIndex = writable(indexPageSize);

export const activeGroups = writable<string[]>([]);
export const activeGroupHeight = writable<number>(0);

export const clearActives = () => {
  activeGroups.set([]);
  activeGroupHeight.set(0);
  startIndex.set(0);
  endIndex.set(indexPageSize);
};

export const clearActiveGroups = () => {
  activeGroups.set([]);
  activeGroupHeight.set(0);
};

export const setActiveGroup = (group: EventGroup) => {
  if (!get(activeGroups).includes(group.id)) {
    activeGroups.set([group.id]);
  } else {
    activeGroupHeight.set(0);
    activeGroups.set([]);
  }
};
