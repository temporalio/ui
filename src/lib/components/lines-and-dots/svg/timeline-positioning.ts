/**
 * Pure positioning math for the bidirectional-fetch timeline.
 *
 * During loading the service fetches from both ends concurrently:
 *   ascending cursor  → groups 0 … descStart-1  (oldest events, top in asc / bottom in desc)
 *   descending cursor → groups descStart … N-1    (newest events, bottom in asc / top in desc)
 *   pending gap       → pendingGroupCount estimated rows between the two cursor ranges
 *
 * Visual layout (ascending sort):
 *   row 2         ← first ascending group
 *   …
 *   row descStart+1  ← last ascending group
 *   [PENDING BLOCK — pendingGroupCount rows]
 *   row descStart+2+pendingGroupCount  ← first descending group
 *   …
 *
 * Visual layout (descending sort, newest-first):
 *   row 2         ← newest descending group  (high index, low y)
 *   …
 *   row N2+1      ← oldest descending group
 *   [PENDING BLOCK — pendingGroupCount rows]
 *   row N2+pendingGroupCount+2  ← newest ascending group
 *   …                           (low index, high y = bottom)
 */

/** Minimal shape needed from EventGroup to locate the cursor split. */
export type GroupForPositioning = {
  initialEvent: { id: string };
};

/**
 * Index of the first group that came from the descending cursor.
 * All groups at indices 0 … descStart-1 are ascending-cursor groups.
 *
 * Uses `initialEvent.id` (the actual event ID, always a sequential integer)
 * rather than `group.id` (the scheduling-event ID which, for timer-fired /
 * external-signal events, points to a *different* earlier event and can break
 * sorted-order assumptions that a binary search would rely on).
 *
 * Returns `groups.length` (i.e. "no split") when:
 *   - descMinId is 0  (descending page hasn't arrived yet)
 *   - loading is false (fetch complete, gap is gone)
 *   - pendingGroupCount is 0 (no gap to render)
 */
export function getDescStart(
  groups: GroupForPositioning[],
  descMinId: number,
  loading: boolean,
  pendingGroupCount: number,
): number {
  if (!descMinId || !loading || !pendingGroupCount) return groups.length;
  for (let i = 0; i < groups.length; i++) {
    if (Number(groups[i].initialEvent.id) >= descMinId) return i;
  }
  return groups.length;
}

/**
 * Total row-span used as the denominator in the descending-sort y formula.
 * When both cursors have contributed rows we extend by pendingGroupCount so
 * there is space for the loading gap between the two cursor ranges.
 * When only one cursor has data (descStart === filteredGroupsLength) we keep
 * it equal to filteredGroupsLength so the loaded rows stay at their natural
 * position near the top/bottom rather than being pushed off-screen.
 */
export function getTotalForY(
  filteredGroupsLength: number,
  pendingGroupCount: number,
  descStart: number,
): number {
  return descStart < filteredGroupsLength && pendingGroupCount > 0
    ? filteredGroupsLength + pendingGroupCount
    : filteredGroupsLength;
}

/**
 * SVG y-coordinate (in px) for the group at index `i` in filteredGroups.
 *
 * Descending-cursor groups (i >= descStart) are shifted by pendingGroupCount
 * rows to open up visual space for the loading gap.
 */
export function getRowY(
  i: number,
  {
    descStart,
    pendingGroupCount,
    totalForY,
    reverseSort,
    height,
  }: {
    descStart: number;
    pendingGroupCount: number;
    totalForY: number;
    reverseSort: boolean;
    height: number;
  },
): number {
  const offset = i >= descStart ? pendingGroupCount : 0;
  return reverseSort
    ? (totalForY + 1 - i - offset) * height
    : (i + 2 + offset) * height;
}

/**
 * SVG y-coordinate for the top edge of the pending-gap rectangle.
 *
 * Ascending sort: gap sits directly below the N1 ascending-cursor rows.
 * Descending sort: gap sits directly below the N2 descending-cursor rows
 *   that occupy the top of the SVG (newest events first).
 */
export function getPendingBlockY({
  descStart,
  filteredGroupsLength,
  reverseSort,
  height,
  radius,
}: {
  descStart: number;
  filteredGroupsLength: number;
  reverseSort: boolean;
  height: number;
  radius: number;
}): number {
  // N2 = number of descending-cursor rows = filteredGroupsLength - descStart
  const topSectionRows = reverseSort
    ? filteredGroupsLength - descStart // N2 desc rows at top in desc sort
    : descStart; // N1 asc rows at top in asc sort
  return (topSectionRows + 2) * height - radius;
}
