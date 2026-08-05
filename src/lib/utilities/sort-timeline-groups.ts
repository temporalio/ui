import { orderGroupsByPending } from './order-groups-by-pending';

/**
 * The fields these sorts read — satisfied by a full EventGroup and by the
 * buffer's LazyGroup, so the timeline can order groups without building them.
 */
type SortableGroup = {
  isPending: boolean;
  initialEvent: { id: string };
};

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
export const sortGroupsDuringLoading = <T extends SortableGroup>(
  groups: T[],
  reverseSort: boolean,
  descMinId: number,
): T[] => {
  if (!descMinId) return groups;

  // Stable partition, not a sort: the key is a boolean and the input is already
  // in event-ID order, so one pass reads `isPending` once per group.
  const pending: T[] = [];
  const rest: T[] = [];
  for (const group of groups) {
    const isActivePending =
      group.isPending && Number(group.initialEvent.id) >= descMinId;
    (isActivePending ? pending : rest).push(group);
  }

  // Mirror orderGroupsByPending(groups, !reverseSort):
  //   reverseSort=true  (descending) → pending to END   (top of screen)
  //   reverseSort=false (ascending)  → pending to START (top of screen)
  return reverseSort ? [...rest, ...pending] : [...pending, ...rest];
};

/**
 * Full groups sort for the timeline — switches strategy based on fetch state.
 */
export const getTimelineGroups = <T extends SortableGroup>(
  groups: T[],
  reverseSort: boolean,
  fetchComplete: boolean,
  descMinId: number,
): T[] => {
  if (fetchComplete) return orderGroupsByPending(groups, !reverseSort);
  return sortGroupsDuringLoading(groups, reverseSort, descMinId);
};
