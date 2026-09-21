import {
  collapseRoutineRows,
  type CollapseSummary,
  type HiddenRunRow,
  isHiddenRunRow,
  type ReviewRowScore,
} from '$lib/utilities/history-review-collapse';

import { ROW_HEIGHT } from './constants';

export type TimelineReviewGroup = {
  readonly id: string;
  readonly version?: number;
  readonly initialEvent: { id: string; eventTime?: unknown };
  readonly lastEvent: { eventTime?: unknown };
  readonly isPending: boolean;
};

/**
 * A hidden run takes one timeline row. `id` and `version` let it share the row
 * pool with groups; `initialEvent` keeps it valid for cursor positioning.
 */
export type TimelineHiddenRun<T extends TimelineReviewGroup> =
  HiddenRunRow<T> & {
    id: string;
    version: number;
    initialEvent: { id: string };
    startTime: unknown;
    endTime: unknown;
  };

export type TimelineRow<T extends TimelineReviewGroup> =
  | T
  | TimelineHiddenRun<T>;

export type TimelineReviewRows<T extends TimelineReviewGroup> = {
  rows: TimelineRow<T>[];
  routineIds: Set<string>;
  summary: CollapseSummary | null;
};

export const isTimelineHiddenRun = <T extends TimelineReviewGroup>(
  row: unknown,
): row is TimelineHiddenRun<T> => isHiddenRunRow<T>(row);

const toTimeMs = (time: unknown): number => {
  const ms = new Date(time as string).getTime();
  return Number.isNaN(ms) ? NaN : ms;
};

const pickTime = <T extends TimelineReviewGroup>(
  groups: T[],
  getTime: (group: T) => unknown,
  pick: (a: number, b: number) => number,
): unknown => {
  let best: unknown;
  let bestMs = NaN;
  for (const group of groups) {
    const time = getTime(group);
    const ms = toTimeMs(time);
    if (Number.isNaN(ms)) continue;
    if (Number.isNaN(bestMs) || pick(ms, bestMs) === ms) {
      best = time;
      bestMs = ms;
    }
  }
  return best;
};

export const buildTimelineReviewRows = <T extends TimelineReviewGroup>({
  groups,
  scores,
  threshold,
  openKeys,
  showAll,
  enabled,
  reverseSort = false,
}: {
  groups: T[];
  scores: Record<string, ReviewRowScore>;
  threshold: number;
  openKeys: ReadonlySet<string>;
  showAll: boolean;
  enabled: boolean;
  /** The timeline keeps ascending order and draws bottom-up when reversed. */
  reverseSort?: boolean;
}): TimelineReviewRows<T> => {
  if (!enabled) {
    return { rows: groups, routineIds: new Set(), summary: null };
  }

  const collapsed = collapseRoutineRows<T>({
    rows: groups,
    getId: (group) => group.id,
    getScore: (group) => (group.isPending ? undefined : scores[group.id]),
    threshold,
    openKeys,
    showAll,
    togglePosition: reverseSort ? 'after' : 'before',
  });

  return {
    routineIds: collapsed.routineIds,
    summary: collapsed.summary,
    rows: collapsed.rows.map((row) =>
      isHiddenRunRow<T>(row)
        ? {
            ...row,
            id: row.key,
            version: row.count * 2 + (row.open ? 1 : 0),
            initialEvent: { id: row.firstId },
            startTime: pickTime(
              row.rows,
              (group) => group.initialEvent.eventTime,
              Math.min,
            ),
            endTime: pickTime(
              row.rows,
              (group) => group.lastEvent.eventTime,
              Math.max,
            ),
          }
        : row,
    ),
  };
};

/** Drawn height of the rows area: two header rows plus one row per entry. */
export const getTimelineHeight = ({
  rowCount,
  pendingGroupCount,
  panelHeight,
}: {
  rowCount: number;
  pendingGroupCount: number;
  panelHeight: number;
}): number =>
  Math.max(ROW_HEIGHT * (rowCount + pendingGroupCount + 2), 120) + panelHeight;
