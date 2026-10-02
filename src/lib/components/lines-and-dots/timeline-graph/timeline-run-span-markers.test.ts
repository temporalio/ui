import { describe, expect, it } from 'vitest';

import { getRunSpanMarkers } from './timeline-run-span-markers';
import type { WorkflowFrameGeometry } from './workflow-frame-geometry';

const geometry = (
  overrides: Partial<WorkflowFrameGeometry> = {},
): WorkflowFrameGeometry => ({
  horizontal: { startPx: 100, endPx: 300 },
  topPx: 0,
  bottomPx: 38,
  drawStartSide: true,
  drawEndSide: true,
  startDotPx: 100,
  endDotPx: 300,
  labelStartPx: 112,
  labelMaxWidthPx: 176,
  ...overrides,
});

const run = (runKey: string | undefined, topPx = 0, visible = true) => ({
  key: `row:${runKey ?? 'event'}`,
  runKey,
  topPx,
  visible,
});

describe('getRunSpanMarkers', () => {
  it('spans a run row from the run start to its end, centred on the row', () => {
    expect(
      getRunSpanMarkers({
        rows: [run('wf:run-1', 76)],
        geometryByRunKey: new Map([['wf:run-1', geometry()]]),
        framedRunKeys: new Set(),
        rowHeight: 38,
      }),
    ).toEqual([
      {
        runKey: 'wf:run-1',
        rowKey: 'row:wf:run-1',
        startPx: 100,
        endPx: 300,
        centerYPx: 95,
        drawStartCap: true,
        drawEndCap: true,
      },
    ]);
  });

  it('skips a run whose container is already drawn', () => {
    expect(
      getRunSpanMarkers({
        rows: [run('wf:run-1')],
        geometryByRunKey: new Map([['wf:run-1', geometry()]]),
        framedRunKeys: new Set(['wf:run-1']),
        rowHeight: 38,
      }),
    ).toEqual([]);
  });

  it('only marks run rows', () => {
    expect(
      getRunSpanMarkers({
        rows: [run(undefined)],
        geometryByRunKey: new Map([['wf:run-1', geometry()]]),
        framedRunKeys: new Set(),
        rowHeight: 38,
      }),
    ).toEqual([]);
  });

  it('skips rows that are not mounted', () => {
    expect(
      getRunSpanMarkers({
        rows: [run('wf:run-1', 0, false)],
        geometryByRunKey: new Map([['wf:run-1', geometry()]]),
        framedRunKeys: new Set(),
        rowHeight: 38,
      }),
    ).toEqual([]);
  });

  it('skips a run that is outside the visible time range', () => {
    expect(
      getRunSpanMarkers({
        rows: [run('wf:run-1')],
        geometryByRunKey: new Map([
          ['wf:run-1', geometry({ horizontal: null })],
        ]),
        framedRunKeys: new Set(),
        rowHeight: 38,
      }),
    ).toEqual([]);
  });

  it('leaves the end open for a run that is still going', () => {
    const [marker] = getRunSpanMarkers({
      rows: [run('wf:run-1')],
      geometryByRunKey: new Map([
        ['wf:run-1', geometry({ drawEndSide: false })],
      ]),
      framedRunKeys: new Set(),
      rowHeight: 38,
    });
    expect(marker.drawStartCap).toBe(true);
    expect(marker.drawEndCap).toBe(false);
  });
});
