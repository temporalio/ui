import type { TimelineEventRow, TimelineRowOrder } from './types';
import { compareEventIds } from '../../data/identity-keys';

function compareTimelineRows(
  left: TimelineEventRow,
  right: TimelineEventRow,
): number {
  const startComparison = compareEventIds(
    left.startEventId,
    right.startEventId,
  );

  if (startComparison) {
    return startComparison;
  }

  const endComparison = compareEventIds(left.endEventId, right.endEventId);

  if (endComparison) {
    return endComparison;
  }

  if (left.rowKey === right.rowKey) {
    return 0;
  }

  return left.rowKey < right.rowKey ? -1 : 1;
}

/** Returns sibling timeline rows ordered by their event sequence. */
export function orderTimelineRows(
  rows: readonly TimelineEventRow[],
  order: TimelineRowOrder,
): readonly TimelineEventRow[] {
  const direction = order === 'ascending' ? 1 : -1;

  return [...rows].sort(
    (left, right) => direction * compareTimelineRows(left, right),
  );
}
