import type { MarkBounds } from './mark-geometry';

const EDGE = 8;
const MARK_GAP = 8;
const NODE_GAP = 4;

export function getLabelX(
  mark: MarkBounds,
  nodes: readonly MarkBounds[],
  labelWidth: number,
  scrollLeft: number,
  viewportWidth: number,
): number {
  const visibleLeft = scrollLeft + EDGE;
  const visibleRight = scrollLeft + viewportWidth - EDGE;
  const insideLeft = Math.max(mark.left + MARK_GAP, visibleLeft);
  const insideRight = Math.min(mark.right - MARK_GAP, visibleRight);
  const blocked = nodes
    .map((node) => ({
      left: node.left - NODE_GAP,
      right: node.right + NODE_GAP,
    }))
    .sort((a, b) => a.left - b.left);

  let gapStart = insideLeft;
  for (const node of blocked) {
    const gapEnd = Math.min(node.left, insideRight);
    if (labelWidth > 0 && gapEnd - gapStart >= labelWidth) return gapStart;
    gapStart = Math.max(gapStart, node.right);
  }
  if (labelWidth > 0 && insideRight - gapStart >= labelWidth) {
    return gapStart;
  }

  const leftRoom = Math.max(
    0,
    Math.min(mark.left - MARK_GAP, visibleRight) - visibleLeft,
  );
  const rightRoom = Math.max(
    0,
    visibleRight - Math.max(mark.right + MARK_GAP, visibleLeft),
  );
  const useLeft = leftRoom >= rightRoom;
  const outsideX = useLeft
    ? mark.left - MARK_GAP - labelWidth
    : mark.right + MARK_GAP;
  return Math.max(
    visibleLeft,
    Math.min(Math.max(visibleLeft, visibleRight - labelWidth), outsideX),
  );
}
