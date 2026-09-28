import type {
  ChildWorkflowEntry,
  ExecutionRowEntry,
  ExecutionSceneEntry,
} from './types';
import { compareEventIds } from '../../data/identity-keys';
import { orderTimelineRows } from '../timeline-rows/order-timeline-rows';
import type { TimelineEventRow } from '../timeline-rows/types';

/** Interleaves child workflows with parent rows by initiating event ID. */
export function orderExecutionEntries(
  rows: readonly TimelineEventRow[],
  children: readonly ChildWorkflowEntry[],
): readonly ExecutionSceneEntry[] {
  const orderedRows: ExecutionRowEntry[] = orderTimelineRows(
    rows,
    'ascending',
  ).map((row) => ({ kind: 'row', row }));
  const entries: ExecutionSceneEntry[] = [...orderedRows, ...children];

  return entries.sort((left, right) => {
    const leftId =
      left.kind === 'row' ? left.row.startEventId : left.initiatedEventId;
    const rightId =
      right.kind === 'row' ? right.row.startEventId : right.initiatedEventId;

    const byEventId = compareEventIds(leftId, rightId);

    if (byEventId) {
      return byEventId;
    }

    if (left.kind !== right.kind) {
      return left.kind === 'row' ? -1 : 1;
    }

    return 0;
  });
}
