/**
 * Moves pending groups to one end, preserving relative order within each side.
 * A partition rather than a sort: the key is a boolean over an already-ordered
 * array, so `isPending` — a getter on LazyGroup — is read once per group
 * instead of ~n log n times.
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
