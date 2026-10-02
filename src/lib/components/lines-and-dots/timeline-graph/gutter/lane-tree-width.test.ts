import { describe, expect, it } from 'vitest';

import {
  LANE_EDGE_INSET,
  LANE_TREE_MIN_WIDTH,
  LANE_TREE_WIDTH,
} from '../constants';
import {
  clampLaneTreeWidth,
  laneTimeOriginPx,
  maxLaneTreeWidth,
} from './lane-tree-width';

describe('maxLaneTreeWidth', () => {
  it('caps the tree at 60% of the view', () => {
    expect(maxLaneTreeWidth(1000)).toBe(600);
  });

  it('never caps below the minimum width', () => {
    expect(maxLaneTreeWidth(200)).toBe(LANE_TREE_MIN_WIDTH);
  });

  it('applies no cap before the view is measured', () => {
    expect(maxLaneTreeWidth(0)).toBe(Infinity);
  });
});

describe('clampLaneTreeWidth', () => {
  it('uses the default width when none is saved', () => {
    expect(clampLaneTreeWidth(undefined, 1600)).toBe(LANE_TREE_WIDTH);
    expect(clampLaneTreeWidth(null, 1600)).toBe(LANE_TREE_WIDTH);
  });

  it('keeps a width that is within bounds', () => {
    expect(clampLaneTreeWidth(512, 1600)).toBe(512);
  });

  it('raises a width below the minimum', () => {
    expect(clampLaneTreeWidth(100, 1600)).toBe(LANE_TREE_MIN_WIDTH);
  });

  it('narrows a saved width that would crowd out the plot', () => {
    expect(clampLaneTreeWidth(900, 1000)).toBe(600);
  });

  it('rounds to whole pixels', () => {
    expect(clampLaneTreeWidth(300.6, 1600)).toBe(301);
  });

  it('keeps the saved width before the view is measured', () => {
    expect(clampLaneTreeWidth(900, 0)).toBe(900);
  });
});

describe('laneTimeOriginPx', () => {
  it('starts time right at the edge of the tree', () => {
    expect(laneTimeOriginPx(300)).toBe(300);
  });

  it('keeps an inset off the edge without the tree', () => {
    expect(laneTimeOriginPx(0)).toBe(LANE_EDGE_INSET);
  });
});
