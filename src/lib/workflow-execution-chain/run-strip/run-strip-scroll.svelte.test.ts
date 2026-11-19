import { describe, expect, it } from 'vitest';

import { getScrollIndicators } from './run-strip-scroll.svelte';

const metrics = { scrollLeft: 200, clientWidth: 400, scrollWidth: 1000 };

describe('getScrollIndicators', () => {
  it('reports nothing before the strip is measured', () => {
    expect(getScrollIndicators(undefined)).toEqual({
      scrolledFromStart: false,
      scrolledFromEnd: false,
    });
  });

  it('reports content scrolled under both edges', () => {
    expect(getScrollIndicators(metrics)).toEqual({
      scrolledFromStart: true,
      scrolledFromEnd: true,
    });
  });

  it('reports neither edge at the start of a strip that fits', () => {
    const fitting = { scrollLeft: 0, clientWidth: 400, scrollWidth: 400 };
    expect(getScrollIndicators(fitting)).toEqual({
      scrolledFromStart: false,
      scrolledFromEnd: false,
    });
  });
});
