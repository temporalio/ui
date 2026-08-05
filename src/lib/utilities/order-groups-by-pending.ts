/**
 * Sorts by pending state only, so it accepts anything carrying `isPending` —
 * a full EventGroup or the buffer's GroupSummary.
 */
export const orderGroupsByPending = <T extends { isPending: boolean }>(
  groups: T[],
  reverseSort: boolean,
): T[] => {
  return groups.toSorted((a, b) => {
    if (a.isPending === b.isPending) return 0;
    if (a.isPending) return reverseSort ? -1 : 1;
    return reverseSort ? 1 : -1;
  });
};
