import type { EventGroups } from '$lib/models/event-groups/event-groups';

import { orderGroupsByPending } from './order-groups-by-pending';

/**
 * Produces the ordered groups array for the timeline during **loading**.
 *
 * Strategy: only treat a group as "active pending" when it is structurally
 * open (isPending) AND its initial event falls inside the portion of the
 * timeline already covered by the descending cursor (id >= descMinId).
 * Groups in the ascending section that are temporarily incomplete — because
 * their companion hasn't been fetched yet — are left in natural event-ID
 * order instead of being hoisted to the top, preventing visible jumping.
 *
 * Call orderGroupsByPending directly once fetchComplete is true.
 *
 * @param groups        - groups in ascending event-ID order
 * @param reverseSort   - true = descending display (newest first)
 * @param descMinId     - lowest event ID seen from the descending cursor;
 *                        0 means no descending page has arrived yet
 */
export const sortGroupsDuringLoading = (
  groups: EventGroups,
  reverseSort: boolean,
  descMinId: number,
): EventGroups => {
  if (!descMinId) return groups;

  return groups.toSorted((a, b) => {
    const aPending = a.isPending && Number(a.initialEvent.id) >= descMinId;
    const bPending = b.isPending && Number(b.initialEvent.id) >= descMinId;
    if (aPending === bPending) return 0;
    // Mirror orderGroupsByPending(groups, !reverseSort):
    //   reverseSort=true  (descending) → pending to END   (top of screen) → return  1
    //   reverseSort=false (ascending)  → pending to START (top of screen) → return -1
    if (aPending) return !reverseSort ? -1 : 1;
    return !reverseSort ? 1 : -1;
  });
};

/**
 * Full groups sort for the timeline — switches strategy based on fetch state.
 */
export const getTimelineGroups = (
  groups: EventGroups,
  reverseSort: boolean,
  fetchComplete: boolean,
  descMinId: number,
): EventGroups => {
  if (fetchComplete) return orderGroupsByPending(groups, !reverseSort);
  return sortGroupsDuringLoading(groups, reverseSort, descMinId);
};
