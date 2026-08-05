/**
 * Moves pending groups to one end, preserving relative order within each side.
 *
 * A stable partition rather than a sort: the key is a boolean and the input is
 * already correctly ordered, so one pass reads `isPending` once per group
 * instead of the ~n log n reads a comparator would. That matters because
 * `isPending` is a getter on the buffer's LazyGroup, and this runs over every
 * group on each update.
 *
 * Accepts anything carrying `isPending` — a full EventGroup or a LazyGroup.
 */
export const orderGroupsByPending = <T extends { isPending: boolean }>(
  groups: T[],
  reverseSort: boolean,
): T[] => {
  const pending: T[] = [];
  const rest: T[] = [];
  for (const group of groups) {
    (group.isPending ? pending : rest).push(group);
  }
  return reverseSort ? [...pending, ...rest] : [...rest, ...pending];
};
