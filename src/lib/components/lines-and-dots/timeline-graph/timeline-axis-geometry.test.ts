import { describe, expect, it, vi } from 'vitest';

import {
  getNiceTimelineIntervalMs,
  getTimelineTimeTicks,
  screenToTimelineWorld,
} from './timeline-axis-geometry';

describe('getNiceTimelineIntervalMs', () => {
  it('chooses whole-second intervals near the target density', () => {
    expect(getNiceTimelineIntervalMs(400)).toBe(1_000);
    expect(getNiceTimelineIntervalMs(2_400)).toBe(2_000);
    expect(getNiceTimelineIntervalMs(4_200)).toBe(5_000);
    expect(getNiceTimelineIntervalMs(8_000)).toBe(10_000);
  });

  it('steps in fractions of a second when asked to', () => {
    expect(getNiceTimelineIntervalMs(40, 1)).toBe(50);
    expect(getNiceTimelineIntervalMs(180, 1)).toBe(200);
    expect(getNiceTimelineIntervalMs(400, 1)).toBe(500);
  });
});

describe('getTimelineTimeTicks', () => {
  it('anchors ticks to exact seconds after the workflow start', () => {
    expect(
      getTimelineTimeTicks({
        visibleStartTimeMs: 1_000,
        visibleEndTimeMs: 7_000,
        originTimeMs: 0,
        intervalMs: 2_000,
        project: (timeMs) => timeMs / 10,
        viewportOffsetPx: 0,
        gutterPx: 0,
        screenStartPx: 0,
        screenEndPx: 1_000,
      }),
    ).toEqual([
      { worldPx: 200, screenPx: 200 },
      { worldPx: 400, screenPx: 400 },
      { worldPx: 600, screenPx: 600 },
    ]);
  });

  it('does not create ticks before the workflow start', () => {
    expect(
      getTimelineTimeTicks({
        visibleStartTimeMs: -60_000,
        visibleEndTimeMs: 3_000,
        originTimeMs: 0,
        intervalMs: 1_000,
        project: (timeMs) => timeMs,
        viewportOffsetPx: 0,
        gutterPx: 0,
        screenStartPx: 0,
        screenEndPx: 3_000,
      }).map(({ worldPx }) => worldPx),
    ).toEqual([0, 1_000, 2_000, 3_000]);
  });

  it('jumps over collapsed time instead of projecting every hidden tick', () => {
    const project = vi.fn((timeMs: number) => timeMs / 1_000);

    expect(
      getTimelineTimeTicks({
        visibleStartTimeMs: 0,
        visibleEndTimeMs: 1_000_000,
        originTimeMs: 0,
        intervalMs: 1_000,
        project,
        viewportOffsetPx: 0,
        gutterPx: 0,
        screenStartPx: 0,
        screenEndPx: 1_000,
        collapsedTimeRanges: [{ startTimeMs: 1_000, endTimeMs: 999_000 }],
      }),
    ).toEqual([
      { worldPx: 0, screenPx: 0 },
      { worldPx: 1_000, screenPx: 1_000 },
    ]);
    expect(project).toHaveBeenCalledTimes(2);
  });
});

describe('screenToTimelineWorld', () => {
  it('adds the viewport offset after removing the screen gutter', () => {
    expect(screenToTimelineWorld(80, 20, 300)).toBe(360);
  });
});
