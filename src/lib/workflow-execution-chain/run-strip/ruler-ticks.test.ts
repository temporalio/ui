import { describe, expect, it } from 'vitest';

import { layoutSegments } from './card-layout';
import { buildRulerTicks, formatClockTime, pickClockStep } from './ruler-ticks';

describe('buildRulerTicks', () => {
  it('gives a live segment only its run tick, whatever its span', () => {
    const tickTimes = (endMs: number) =>
      buildRulerTicks([
        { id: 'run-a', x: 0, width: 600, startMs: 0, endMs, live: true },
      ]).map(({ kind, x, step }) => ({ kind, x, step }));

    expect(tickTimes(60_000)).toEqual([{ kind: 'run', x: 0, step: 1_000 }]);
    expect(tickTimes(3_600_000)).toEqual(tickTimes(60_000));
  });

  it('keys ticks by their segment so equal times stay distinct', () => {
    const ticks = buildRulerTicks(
      layoutSegments(
        [200, 200],
        [
          { id: 'run-a', startMs: 0, endMs: 0, live: false },
          { id: 'run-b', startMs: 0, endMs: 0, live: false },
        ],
      ),
    );
    const keys = ticks.map(
      (tick) => `${tick.segmentId}-${tick.kind}-${tick.time}`,
    );

    expect(new Set(keys).size).toBe(keys.length);
    expect(ticks.filter((tick) => tick.kind === 'run')).toHaveLength(2);
  });

  it('picks the smallest clock step that leaves room for a label', () => {
    expect(pickClockStep(1000 / 100)).toBe(1_000);
    expect(pickClockStep(60_000 / 100)).toBe(60_000);
  });

  it('starts each Run with a labelled run tick', () => {
    const ticks = buildRulerTicks([
      { id: 'run-a', x: 0, width: 300, startMs: 0, endMs: 60_000, live: false },
      {
        id: 'run-b',
        x: 306,
        width: 300,
        startMs: 60_000,
        endMs: 120_000,
        live: false,
      },
    ]);
    const runTicks = ticks.filter((tick) => tick.kind === 'run');

    expect(
      runTicks.map(({ x, time, labelled }) => ({ x, time, labelled })),
    ).toEqual([
      { x: 0, time: 0, labelled: true },
      { x: 306, time: 60_000, labelled: true },
    ]);
  });

  it('adds major and minor ticks on clock steps inside the Run', () => {
    const ticks = buildRulerTicks([
      { id: 'run-a', x: 0, width: 600, startMs: 0, endMs: 60_000, live: false },
    ]);
    const majors = ticks.filter((tick) => tick.kind === 'major');
    const minors = ticks.filter((tick) => tick.kind === 'minor');

    expect(majors.length).toBeGreaterThan(0);
    expect(minors.length).toBeGreaterThan(0);
    for (const tick of [...majors, ...minors]) {
      expect(tick.time % (tick.step / 2)).toBe(0);
      expect(tick.x).toBeGreaterThan(0);
      expect(tick.x).toBeLessThan(600);
    }
    for (const tick of majors) {
      expect(tick.time % tick.step).toBe(0);
    }
  });

  it('only labels major ticks with room from the Run edges', () => {
    const ticks = buildRulerTicks([
      { id: 'run-a', x: 0, width: 600, startMs: 0, endMs: 60_000, live: false },
    ]);

    for (const tick of ticks.filter((tick) => tick.labelled)) {
      if (tick.kind === 'run') {
        continue;
      }
      expect(tick.x).toBeGreaterThanOrEqual(126);
      expect(600 - tick.x).toBeGreaterThanOrEqual(44);
    }
    expect(ticks.some((tick) => tick.kind === 'major' && !tick.labelled)).toBe(
      true,
    );
  });

  it('skips segments with no width or span', () => {
    expect(
      buildRulerTicks([
        { id: 'run-a', x: 0, width: 0, startMs: 0, endMs: 1000, live: false },
      ]),
    ).toEqual([]);
  });
});

describe('formatClockTime', () => {
  const time = Date.UTC(2024, 0, 2, 15, 4, 5);

  it('formats a clock time in the chosen timezone and hour format', () => {
    expect(formatClockTime(time, { timeFormat: 'UTC', hourFormat: '24' })).toBe(
      '15:04:05',
    );
    expect(
      formatClockTime(time, { timeFormat: 'UTC', hourFormat: '12' }),
    ).toMatch(/^3:04:05\sPM$/);
  });

  it('drops seconds and adds the date on request', () => {
    expect(
      formatClockTime(time, {
        timeFormat: 'UTC',
        hourFormat: '24',
        withSeconds: false,
        withDate: true,
      }),
    ).toMatch(/Jan 2.*15:04/);
  });

  it('applies the timezone', () => {
    expect(
      formatClockTime(time, {
        timeFormat: 'America/New_York',
        hourFormat: '24',
      }),
    ).toBe('10:04:05');
  });
});

describe('buildRulerTicks over long spans', () => {
  it('steps by days or more for a Run lasting years', () => {
    const spanMs = 3 * 365 * 86_400_000;
    const ticks = buildRulerTicks([
      { id: 'run-a', x: 0, width: 600, startMs: 0, endMs: spanMs, live: false },
    ]);

    expect(ticks.length).toBeLessThan(60);
    expect(ticks[0].step).toBeGreaterThanOrEqual(86_400_000);
  });

  it('draws only the run tick when no step is coarse enough', () => {
    const ticks = buildRulerTicks([
      {
        id: 'run-a',
        x: 0,
        width: 10,
        startMs: 0,
        endMs: 100 * 365 * 86_400_000,
        live: false,
      },
    ]);

    expect(ticks.map((tick) => tick.kind)).toEqual(['run']);
  });
});

describe('dated major labels', () => {
  it('leave room after the dated run label and before the segment end', () => {
    const spanMs = 60 * 86_400_000;
    const ticks = buildRulerTicks([
      { id: 'run-a', x: 0, width: 800, startMs: 0, endMs: spanMs, live: false },
    ]);
    const labelled = ticks.filter(
      (tick) => tick.kind === 'major' && tick.labelled,
    );

    expect(ticks[0].step).toBeGreaterThanOrEqual(86_400_000);
    expect(labelled.length).toBeGreaterThan(0);
    for (const tick of labelled) {
      expect(tick.x).toBeGreaterThanOrEqual(186);
      expect(800 - tick.x).toBeGreaterThanOrEqual(56);
    }
  });
});
