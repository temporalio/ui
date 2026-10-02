import { describe, expect, it } from 'vitest';

import {
  formatTimelineChainDuration,
  formatTimelineChainTickTime,
  getTimelineChainTimeTicks,
} from './timeline-chain-time-axis';

describe('timeline chain time axis', () => {
  it.each([
    [999, '1s'],
    [12_000, '12s'],
    [72_000, '1m 12s'],
    [3_600_000, '1h'],
    [5_490_000, '1h 31m'],
    [93_600_000, '1d 2h'],
  ])('formats a %dms chain duration as %s', (durationMs, expected) => {
    expect(formatTimelineChainDuration(durationMs)).toBe(expected);
  });

  it('keeps ticks within the same second apart with fractions of one', () => {
    const timeMs = Date.UTC(2026, 9, 2, 14, 34, 3, 462);
    const format = (durationMs: number) =>
      formatTimelineChainTickTime({
        timeMs,
        durationMs,
        timeFormat: 'UTC',
        hourFormat: '24',
      });
    expect(format(303)).toBe('14:34:03.46');
    expect(format(3_000)).toBe('14:34:03.4');
    expect(format(72_000)).toBe('14:34:03');
  });

  it('adapts the number of ticks to the available width', () => {
    expect(
      getTimelineChainTimeTicks({
        startTimeMs: 1_000,
        endTimeMs: 73_000,
        widthPx: 300,
      }),
    ).toEqual([
      { timeMs: 1_000, positionPercent: 0, edge: 'start' },
      { timeMs: 73_000, positionPercent: 100, edge: 'end' },
    ]);

    expect(
      getTimelineChainTimeTicks({
        startTimeMs: 1_000,
        endTimeMs: 73_000,
        widthPx: 1_100,
      }),
    ).toEqual([
      { timeMs: 1_000, positionPercent: 0, edge: 'start' },
      { timeMs: 19_000, positionPercent: 25, edge: 'middle' },
      { timeMs: 37_000, positionPercent: 50, edge: 'middle' },
      { timeMs: 55_000, positionPercent: 75, edge: 'middle' },
      { timeMs: 73_000, positionPercent: 100, edge: 'end' },
    ]);
  });

  it('formats tick precision for the chain duration', () => {
    const timeMs = Date.UTC(2026, 8, 13, 20, 3, 13);

    expect(
      formatTimelineChainTickTime({
        timeMs,
        durationMs: 72_000,
        timeFormat: 'UTC',
        hourFormat: '24',
      }),
    ).toBe('20:03:13');
    expect(
      formatTimelineChainTickTime({
        timeMs,
        durationMs: 48 * 60 * 60_000,
        timeFormat: 'UTC',
        hourFormat: '24',
      }),
    ).toMatch(/Sep 13,? 20/);
  });
});
