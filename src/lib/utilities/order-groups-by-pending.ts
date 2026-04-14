import type { EventGroups } from '$lib/models/event-groups/event-groups';

export const orderGroupsByPending = (
  groups: EventGroups,
  reverseSort: boolean,
): EventGroups => {
  const pendingGroups = groups.filter((g) => g.isPending);
  const nonPendingGroups = groups.filter((g) => !g.isPending);

  return reverseSort
    ? [...pendingGroups, ...nonPendingGroups]
    : [...nonPendingGroups, ...pendingGroups];
};
