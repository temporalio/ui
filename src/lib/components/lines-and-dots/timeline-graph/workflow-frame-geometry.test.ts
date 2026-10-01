import { describe, expect, it } from 'vitest';

import { RADIUS, ROW_HEIGHT } from './constants';
import {
  getTimelineFrameVerticalLayout,
  getWorkflowFrameGeometry,
  getWorkflowFrameVerticalBounds,
} from './workflow-frame-geometry';

const geometry = (
  overrides: Partial<Parameters<typeof getWorkflowFrameGeometry>[0]> = {},
) =>
  getWorkflowFrameGeometry({
    startWorldPx: 0,
    endWorldPx: 75,
    viewportOffsetPx: 0,
    viewportWidthPx: 100,
    gutterPx: 20,
    topPx: 30,
    bottomPx: 90,
    startBoundaryKnown: true,
    endBoundaryKnown: true,
    labelInsetPx: 8,
    ...overrides,
  });

describe('getWorkflowFrameGeometry', () => {
  it('clips horizontally without inventing a start boundary', () => {
    expect(
      geometry({
        startWorldPx: 0,
        endWorldPx: 250,
        viewportOffsetPx: 150,
      }),
    ).toMatchObject({
      horizontal: { startPx: 20, endPx: 120 },
      drawStartSide: false,
      drawEndSide: true,
      startDotPx: null,
      endDotPx: 120,
      labelStartPx: -122,
      labelMaxWidthPx: 234,
    });
  });

  it('suppresses a visible boundary when it is not known', () => {
    expect(geometry({ startBoundaryKnown: false })).toMatchObject({
      drawStartSide: false,
      startDotPx: null,
    });
  });

  it('uses actual vertical coordinates and enforces a one-row minimum', () => {
    expect(geometry({ topPx: 120, bottomPx: 120 })).toMatchObject({
      topPx: 120,
      bottomPx: 144,
    });
    expect(geometry({ topPx: 40, bottomPx: 143 })).toMatchObject({
      topPx: 40,
      bottomPx: 143,
    });
  });

  it('returns the usable label width of the complete frame', () => {
    expect(geometry()).toMatchObject({
      labelStartPx: 28,
      labelMaxWidthPx: 59,
    });
  });

  it('renders one boundary dot when both boundaries project to one pixel', () => {
    expect(geometry({ startWorldPx: 25, endWorldPx: 25 })).toMatchObject({
      startDotPx: 45,
      endDotPx: null,
    });
  });

  it('returns no paint for a frame outside the viewport', () => {
    expect(
      geometry({ startWorldPx: 0, endWorldPx: 100, viewportOffsetPx: 150 }),
    ).toMatchObject({
      horizontal: null,
      drawStartSide: false,
      drawEndSide: false,
      labelMaxWidthPx: 0,
    });
  });
});

describe('getWorkflowFrameVerticalBounds', () => {
  it('pads the frame away from its first and last content rows', () => {
    expect(
      getWorkflowFrameVerticalBounds({
        rowStart: 0,
        rowEnd: 1,
        activeRowIndex: -1,
        panelHeight: 0,
        paddingPx: 9,
      }),
    ).toEqual({ topPx: 27, bottomPx: 69 });
  });

  it('keeps padding outside an expanded details panel', () => {
    expect(
      getWorkflowFrameVerticalBounds({
        rowStart: 0,
        rowEnd: 2,
        activeRowIndex: 0,
        panelHeight: 100,
        paddingPx: 9,
      }),
    ).toEqual({ topPx: 27, bottomPx: 193 });
  });
});

describe('getTimelineFrameVerticalLayout', () => {
  const runSpan = (
    key: string,
    workflowKey: string,
    rowStart: number,
    rowEnd: number,
    depth = 0,
  ) => ({
    key,
    workflowKey,
    runId: key,
    rowStart,
    rowEnd,
    depth,
    ancestorRunKeys: [],
    headerRow: true,
  });

  const workflowSpan = (
    workflowKey: string,
    rowStart: number,
    rowEnd: number,
    depth: number,
  ) => ({
    key: `${workflowKey}:span`,
    workflowKey,
    headerKey: `${workflowKey}:header`,
    headerKind: 'synthetic' as const,
    rowStart,
    rowEnd,
    depth,
    ancestorRunKeys: [],
  });

  it('places adjoining run borders on one shared boundary', () => {
    const layout = getTimelineFrameVerticalLayout({
      runSpans: [
        runSpan('first', 'workflow', 1, 3),
        runSpan('second', 'workflow', 3, 5),
      ],
      workflowSpans: [],
      activeRowIndex: -1,
      panelHeight: 0,
      verticalPaddingPx: 12,
    });

    expect(layout.runBoundsByKey.get('first')).toEqual({
      topPx: 81,
      bottomPx: 129,
    });
    expect(layout.runBoundsByKey.get('second')).toEqual({
      topPx: 129,
      bottomPx: 177,
    });
  });

  it('keeps the final run inside its workflow box', () => {
    const layout = getTimelineFrameVerticalLayout({
      runSpans: [runSpan('run', 'root', 1, 5)],
      workflowSpans: [workflowSpan('root', 0, 5, 0)],
      activeRowIndex: -1,
      panelHeight: 0,
      verticalPaddingPx: 12,
    });
    const run = layout.runBoundsByKey.get('run')!;
    const workflow = layout.workflowBoundsByKey.get('root')!;

    expect(run.bottomPx).toBe(177);
    expect(workflow).toEqual({ topPx: 60, bottomPx: 189 });
    expect(workflow.topPx).toBeLessThan(run.topPx);
    expect(workflow.bottomPx).toBeGreaterThan(run.bottomPx);
    expect(run.topPx - (workflow.topPx + RADIUS)).toBe(ROW_HEIGHT / 2);
    expect(workflow.bottomPx - run.bottomPx).toBe(ROW_HEIGHT / 2);
  });

  it('keeps the workflow-to-run header gap constant at every depth', () => {
    const rootLayout = getTimelineFrameVerticalLayout({
      runSpans: [runSpan('root-run', 'root', 1, 5)],
      workflowSpans: [workflowSpan('root', 0, 6, 0)],
      activeRowIndex: -1,
      panelHeight: 0,
      verticalPaddingPx: 12,
    });
    const layout = getTimelineFrameVerticalLayout({
      runSpans: [runSpan('child-run', 'child', 2, 4, 2)],
      workflowSpans: [workflowSpan('child', 1, 5, 2)],
      activeRowIndex: -1,
      panelHeight: 0,
      verticalPaddingPx: 12,
    });
    const rootRun = rootLayout.runBoundsByKey.get('root-run')!;
    const rootWorkflow = rootLayout.workflowBoundsByKey.get('root')!;
    const run = layout.runBoundsByKey.get('child-run')!;
    const workflow = layout.workflowBoundsByKey.get('child')!;

    expect(workflow).toEqual({ topPx: 84, bottomPx: 189 });
    expect(run.topPx - workflow.topPx).toBe(rootRun.topPx - rootWorkflow.topPx);
    expect(workflow.topPx).toBeLessThan(run.topPx);
    expect(workflow.bottomPx).toBeGreaterThan(run.bottomPx);
  });
});
