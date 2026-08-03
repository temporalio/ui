import { RADIUS, ROW_HEIGHT } from './constants';

export type GroupForPositioning = {
  initialEvent: { id: string };
};

// First index whose group came from the descending cursor (groups[0..descStart-1]
// are ascending). Uses initialEvent.id (a real sequential event id), not group.id,
// which for timer/signal events points at an earlier event and breaks sort order.
// Returns groups.length ("no split") while there's no gap to render.
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

// Denominator for the descending-sort y formula. Extended by pendingGroupCount
// only when both cursors have rows (so the loading gap has space); otherwise it
// stays at filteredGroupsLength so loaded rows keep their natural position.
export function getTotalForY(
  filteredGroupsLength: number,
  pendingGroupCount: number,
  descStart: number,
): number {
  return descStart < filteredGroupsLength && pendingGroupCount > 0
    ? filteredGroupsLength + pendingGroupCount
    : filteredGroupsLength;
}

// y (px) for the group at index i. Descending-cursor groups (i >= descStart)
// shift down by pendingGroupCount rows to open the loading gap.
export function getRowY(
  i: number,
  {
    descStart,
    pendingGroupCount,
    totalForY,
    reverseSort,
  }: {
    descStart: number;
    pendingGroupCount: number;
    totalForY: number;
    reverseSort: boolean;
  },
): number {
  const offset = i >= descStart ? pendingGroupCount : 0;
  return reverseSort
    ? (totalForY + 1 - i - offset) * ROW_HEIGHT
    : (i + 2 + offset) * ROW_HEIGHT;
}

// y (px) for the top of the pending-gap rectangle — just below whichever rows sit
// at the top of the graph (ascending rows, or descending rows when reverseSort).
export function getPendingBlockY({
  descStart,
  filteredGroupsLength,
  reverseSort,
}: {
  descStart: number;
  filteredGroupsLength: number;
  reverseSort: boolean;
}): number {
  const topSectionRows = reverseSort
    ? filteredGroupsLength - descStart
    : descStart;
  return (topSectionRows + 2) * ROW_HEIGHT - RADIUS;
}

export const timelineTextPosition = (
  points: number[],
  y: number,
  width: number,
  isPending: boolean,
) => {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  let backdrop = false;
  let textAnchor = 'start';
  let textIndex = 0;

  const textToLeft = firstPoint > (1 / 2) * width;
  let textToRight = !textToLeft && lastPoint < (2 / 3) * width && !isPending;

  if (textToLeft) textAnchor = 'end';
  if (textToRight) textIndex = points.indexOf(lastPoint);

  const offset = 1.5 * RADIUS;
  let textX = textToRight ? lastPoint + offset : firstPoint - offset;

  // Pending or long events
  if (!textToRight && !textToLeft) {
    backdrop = true;
    textToRight = true;
    textX = firstPoint + offset;

    if (points.length === 2 && isPending) {
      const gap = points[1] - points[0];
      if (gap < width - points[1]) {
        textIndex = 1;
        textX = points[1] + offset;
      }
    }

    if (points.length > 2) {
      const gap1 = points[1] - points[0];
      const gap2 = points[2] - points[1];
      if (gap2 > gap1) {
        textIndex = 1;
        textX = points[1] + offset;
      }
    }
  }

  const textPosition = [textX, y] as [number, number];
  return { textPosition, textIndex, textAnchor, backdrop };
};
