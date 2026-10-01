import { RADIUS, ROW_HEIGHT } from './constants';
import type {
  TimelineRunSpan,
  TimelineWorkflowSpan,
} from './timeline-containment-layout';
import { clipConnectorToViewport } from './viewport-geometry';

export type WorkflowFrameGeometry = {
  horizontal: { startPx: number; endPx: number } | null;
  topPx: number;
  bottomPx: number;
  drawStartSide: boolean;
  drawEndSide: boolean;
  startDotPx: number | null;
  endDotPx: number | null;
  labelStartPx: number;
  labelMaxWidthPx: number;
};

export type TimelineFrameVerticalLayout = {
  runBoundsByKey: Map<string, { topPx: number; bottomPx: number }>;
  workflowBoundsByKey: Map<string, { topPx: number; bottomPx: number }>;
};

export function getTimelineFrameVerticalLayout({
  runSpans,
  workflowSpans,
  activeRowIndex,
  panelHeight,
  verticalPaddingPx,
  rowHeight = ROW_HEIGHT,
}: {
  runSpans: TimelineRunSpan[];
  workflowSpans: TimelineWorkflowSpan[];
  activeRowIndex: number;
  panelHeight: number;
  verticalPaddingPx: number;
  rowHeight?: number;
}): TimelineFrameVerticalLayout {
  const runBoundsByKey = new Map<string, { topPx: number; bottomPx: number }>();
  for (const span of runSpans) {
    const bounds = getWorkflowFrameVerticalBounds({
      ...span,
      activeRowIndex,
      panelHeight,
      paddingPx: 0,
      rowHeight,
    });
    runBoundsByKey.set(span.key, {
      topPx: bounds.topPx + verticalPaddingPx + RADIUS,
      bottomPx: bounds.bottomPx + verticalPaddingPx + RADIUS,
    });
  }
  const workflowBoundsByKey = new Map<
    string,
    { topPx: number; bottomPx: number }
  >();
  for (const span of workflowSpans) {
    const bounds = getWorkflowFrameVerticalBounds({
      ...span,
      activeRowIndex,
      panelHeight,
      paddingPx: 0,
      rowHeight,
    });
    workflowBoundsByKey.set(span.workflowKey, {
      topPx: bounds.topPx + verticalPaddingPx + rowHeight / 2,
      bottomPx: bounds.bottomPx + verticalPaddingPx + RADIUS + rowHeight / 2,
    });
  }
  return { runBoundsByKey, workflowBoundsByKey };
}

export function getWorkflowFrameVerticalBounds({
  rowStart,
  rowEnd,
  activeRowIndex,
  panelHeight,
  paddingPx,
  rowHeight = ROW_HEIGHT,
}: {
  rowStart: number;
  rowEnd: number;
  activeRowIndex: number;
  panelHeight: number;
  paddingPx: number;
  rowHeight?: number;
}): { topPx: number; bottomPx: number } {
  let topPx = (rowStart + 1.5) * rowHeight;
  let bottomPx = (rowEnd + 1.5) * rowHeight;
  if (activeRowIndex >= 0 && panelHeight > 0) {
    if (rowStart > activeRowIndex) {
      topPx += panelHeight;
      bottomPx += panelHeight;
    } else if (rowEnd > activeRowIndex) {
      bottomPx += panelHeight;
    }
  }
  return { topPx: topPx - paddingPx, bottomPx: bottomPx + paddingPx };
}

export function getWorkflowFrameGeometry({
  startWorldPx,
  endWorldPx,
  viewportOffsetPx,
  viewportWidthPx,
  gutterPx,
  topPx,
  bottomPx,
  startBoundaryKnown,
  endBoundaryKnown,
  labelInsetPx,
  rowHeight = ROW_HEIGHT,
}: {
  startWorldPx: number;
  endWorldPx: number;
  viewportOffsetPx: number;
  viewportWidthPx: number;
  gutterPx: number;
  topPx: number;
  bottomPx: number;
  startBoundaryKnown: boolean;
  endBoundaryKnown: boolean;
  labelInsetPx: number;
  rowHeight?: number;
}): WorkflowFrameGeometry {
  const viewport = { offsetPx: viewportOffsetPx, widthPx: viewportWidthPx };
  const clipped = clipConnectorToViewport(
    { startPx: startWorldPx, endPx: endWorldPx },
    viewport,
  );
  const normalizedTop = Math.min(topPx, bottomPx);
  const normalizedBottom = Math.max(topPx, bottomPx, normalizedTop + rowHeight);
  if (!clipped) {
    return {
      horizontal: null,
      topPx: normalizedTop,
      bottomPx: normalizedBottom,
      drawStartSide: false,
      drawEndSide: false,
      startDotPx: null,
      endDotPx: null,
      labelStartPx: gutterPx,
      labelMaxWidthPx: 0,
    };
  }

  const viewportEndPx = viewportOffsetPx + viewportWidthPx;
  const startVisible =
    startWorldPx >= viewportOffsetPx && startWorldPx <= viewportEndPx;
  const endVisible =
    endWorldPx >= viewportOffsetPx && endWorldPx <= viewportEndPx;
  const startPx = clipped.startPx + gutterPx;
  const endPx = clipped.endPx + gutterPx;
  const drawStartSide = startBoundaryKnown && startVisible;
  const drawEndSide = endBoundaryKnown && endVisible;

  return {
    horizontal: { startPx, endPx },
    topPx: normalizedTop,
    bottomPx: normalizedBottom,
    drawStartSide,
    drawEndSide,
    startDotPx: drawStartSide
      ? startWorldPx - viewportOffsetPx + gutterPx
      : null,
    endDotPx:
      drawEndSide && endWorldPx !== startWorldPx
        ? endWorldPx - viewportOffsetPx + gutterPx
        : null,
    labelStartPx: startWorldPx - viewportOffsetPx + gutterPx + labelInsetPx,
    labelMaxWidthPx: Math.max(0, endWorldPx - startWorldPx - 2 * labelInsetPx),
  };
}
