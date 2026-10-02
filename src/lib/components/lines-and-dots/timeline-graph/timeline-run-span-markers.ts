import type { WorkflowFrameGeometry } from './workflow-frame-geometry';

export type TimelineRunSpanMarker = {
  runKey: string;
  rowKey: string;
  startPx: number;
  endPx: number;
  centerYPx: number;
  drawStartCap: boolean;
  drawEndCap: boolean;
};

type RunRow = {
  key: string;
  /** Set only on a run's own row. */
  runKey: string | undefined;
  topPx: number;
  visible: boolean;
};

/**
 * A run's own row has nothing of its own to plot, so wherever its container
 * isn't drawn — folded, or groups switched off — the row carries a span from
 * the run's start to its end. It is where the run sits in time even when
 * nothing inside it is showing.
 */
export const getRunSpanMarkers = ({
  rows,
  geometryByRunKey,
  framedRunKeys,
  rowHeight,
}: {
  rows: readonly RunRow[];
  geometryByRunKey: ReadonlyMap<string, WorkflowFrameGeometry>;
  framedRunKeys: ReadonlySet<string>;
  rowHeight: number;
}): TimelineRunSpanMarker[] =>
  rows.flatMap(({ key, runKey, topPx, visible }) => {
    if (!runKey || !visible || framedRunKeys.has(runKey)) return [];
    const geometry = geometryByRunKey.get(runKey);
    if (!geometry?.horizontal) return [];
    return [
      {
        runKey,
        rowKey: key,
        startPx: geometry.horizontal.startPx,
        endPx: geometry.horizontal.endPx,
        centerYPx: topPx + rowHeight / 2,
        drawStartCap: geometry.drawStartSide,
        drawEndCap: geometry.drawEndSide,
      },
    ];
  });
