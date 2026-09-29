const NODE_WIDTH = 20;
const NODE_RADIUS = NODE_WIDTH / 2;

export type MarkBounds = Readonly<{ left: number; right: number }>;

export function getNodeBounds(
  x: number,
  mark: MarkBounds,
  alignment: 'start' | 'end' | 'center',
): MarkBounds {
  const anchor = getNodeAnchorX(x, mark, alignment !== 'center');
  const left =
    alignment === 'start'
      ? anchor
      : alignment === 'end'
        ? anchor - NODE_WIDTH
        : anchor - NODE_RADIUS;
  return { left, right: left + NODE_WIDTH };
}

/** Leave enough painted mark for both time-anchored endpoint icons. */
export function getMarkBounds(left: number, right: number): MarkBounds {
  const shortfall = Math.max(0, NODE_WIDTH - (right - left));
  return { left: left - shortfall, right: right + shortfall };
}

/** Keep intermediate icons within the mark without shifting endpoint timestamps. */
export function getNodeAnchorX(
  x: number,
  bounds: MarkBounds,
  isEndpoint: boolean,
): number {
  if (isEndpoint) return x;
  return Math.max(
    bounds.left + NODE_RADIUS,
    Math.min(bounds.right - NODE_RADIUS, x),
  );
}
