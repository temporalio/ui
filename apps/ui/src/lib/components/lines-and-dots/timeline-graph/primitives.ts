// Geometry helpers for the timeline's HTML rows (colors live in ../colors).

import { DOT_STROKE, RADIUS } from './constants';

// Top-left of a dot's box centered on (centerX, centerY); size comes from CSS vars.
export function dotBox(
  centerX: number,
  centerY: number,
): { left: number; top: number } {
  const offset = RADIUS + DOT_STROKE / 2;
  return { left: centerX - offset, top: centerY - offset };
}

export type Box = { left: number; top: number; width: number; height: number };

// Axis-aligned line between two points as a div box; negative x clamps to 0.
export function lineBox(
  startPoint: [x: number, y: number],
  endPoint: [x: number, y: number],
): Box {
  const strokeWidth = RADIUS * 2;
  const x1 = Math.max(0, startPoint[0]);
  const y1 = startPoint[1];
  const x2 = Math.max(0, endPoint[0]);
  const y2 = endPoint[1];
  const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  return {
    left: horizontal ? Math.min(x1, x2) : x1 - strokeWidth / 2,
    top: horizontal ? y1 - strokeWidth / 2 : Math.min(y1, y2),
    width: horizontal ? Math.abs(x2 - x1) : strokeWidth,
    height: horizontal ? strokeWidth : Math.abs(y2 - y1),
  };
}
