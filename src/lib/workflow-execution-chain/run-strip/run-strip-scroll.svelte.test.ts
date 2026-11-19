import { describe, expect, it } from 'vitest';

import type { RunSegment } from './card-layout';

import { getScrollIndicators } from './run-strip-scroll.svelte';

const segment = (x: number, width = 100): RunSegment => ({
  id: 'run-a',
  x,
  width,
  startMs: 0,
  endMs: 1,
  live: false,
});

const metrics = { scrollLeft: 200, clientWidth: 400, scrollWidth: 1000 };

describe('getScrollIndicators', () => {
  it('reports nothing before the strip is measured', () => {
    expect(getScrollIndicators(undefined, segment(5000))).toEqual({
      scrolledFromStart: false,
      scrolledFromEnd: false,
      selectedOutOfView: false,
    });
  });

  it('reports content scrolled under both edges', () => {
    expect(getScrollIndicators(metrics, undefined)).toEqual({
      scrolledFromStart: true,
      scrolledFromEnd: true,
      selectedOutOfView: false,
    });
  });

  it('reports neither edge at the start of a strip that fits', () => {
    const fitting = { scrollLeft: 0, clientWidth: 400, scrollWidth: 400 };
    expect(getScrollIndicators(fitting, undefined)).toMatchObject({
      scrolledFromStart: false,
      scrolledFromEnd: false,
    });
  });

  it('keeps a selected segment inside the viewport in view', () => {
    expect(getScrollIndicators(metrics, segment(300)).selectedOutOfView).toBe(
      false,
    );
  });

  it('marks a selected segment left of the viewport out of view', () => {
    expect(getScrollIndicators(metrics, segment(0)).selectedOutOfView).toBe(
      true,
    );
  });

  it('marks a selected segment right of the viewport out of view', () => {
    expect(getScrollIndicators(metrics, segment(700)).selectedOutOfView).toBe(
      true,
    );
  });
});
