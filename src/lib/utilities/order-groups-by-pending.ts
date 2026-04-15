import type { EventGroups } from '$lib/models/event-groups/event-groups';

export const orderGroupsByPending = (
  groups: EventGroups,
  reverseSort: boolean,
): EventGroups => {
  return groups.toSorted((a, b) => {
    if (a.isPending === b.isPending) return 0;
    if (a.isPending) return reverseSort ? -1 : 1;
    return reverseSort ? 1 : -1;
  });
};
