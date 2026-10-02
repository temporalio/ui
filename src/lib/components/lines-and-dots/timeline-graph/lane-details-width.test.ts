import { describe, expect, it } from 'vitest';

import { LANE_DETAILS_MIN_WIDTH, LANE_DETAILS_WIDTH } from './constants';
import {
  clampLaneDetailsWidth,
  maxLaneDetailsWidth,
} from './lane-details-width';

describe('maxLaneDetailsWidth', () => {
  it('caps the panel at half the row', () => {
    expect(maxLaneDetailsWidth(1600)).toBe(800);
  });

  it('never caps below the minimum width', () => {
    expect(maxLaneDetailsWidth(400)).toBe(LANE_DETAILS_MIN_WIDTH);
  });

  it('applies no cap before the row is measured', () => {
    expect(maxLaneDetailsWidth(0)).toBe(Infinity);
  });
});

describe('clampLaneDetailsWidth', () => {
  it('uses the default width when none is saved', () => {
    expect(clampLaneDetailsWidth(null, 1600)).toBe(LANE_DETAILS_WIDTH);
  });

  it('keeps a width that is within bounds', () => {
    expect(clampLaneDetailsWidth(560, 1600)).toBe(560);
  });

  it('raises a width below the minimum', () => {
    expect(clampLaneDetailsWidth(100, 1600)).toBe(LANE_DETAILS_MIN_WIDTH);
  });

  it('narrows a saved width that would crowd out the timeline', () => {
    expect(clampLaneDetailsWidth(900, 1200)).toBe(600);
  });
});
