const NODE_WIDTH = 20;
const NODE_RADIUS = NODE_WIDTH / 2;

export type MarkBounds = Readonly<{ left: number; right: number }>;

export function getMarkGeometry(
  left: number,
  right: number,
  eventPositions: readonly number[],
  contentWidth: number,
): Readonly<{ bounds: MarkBounds; nodeCenters: readonly number[] }> {
  const preferred = eventPositions.map((x, index) => {
    if (eventPositions.length === 1) return x;
    if (index === 0) return x + NODE_RADIUS;
    if (index === eventPositions.length - 1) return x - NODE_RADIUS;
    return x;
  });
  const nodeCenters: number[] = [];

  for (const x of preferred) {
    const previous = nodeCenters.at(-1);
    nodeCenters.push(
      previous === undefined ? x : Math.max(x, previous + NODE_WIDTH),
    );
  }

  const first = nodeCenters[0];
  const last = nodeCenters.at(-1);
  const preferredFirst = preferred[0];
  const preferredLast = preferred.at(-1);

  if (
    first === undefined ||
    last === undefined ||
    preferredFirst === undefined ||
    preferredLast === undefined
  ) {
    return { bounds: { left, right }, nodeCenters };
  }

  const centeredShift = (preferredFirst - first + (preferredLast - last)) / 2;
  const minimumShift = NODE_RADIUS - first;
  const maximumShift = contentWidth - NODE_RADIUS - last;
  const shift =
    minimumShift <= maximumShift
      ? Math.max(minimumShift, Math.min(maximumShift, centeredShift))
      : minimumShift;
  const displayedCenters = nodeCenters.map((x) => x + shift);

  return {
    bounds: {
      left: Math.min(left, first + shift - NODE_RADIUS),
      right: Math.max(right, last + shift + NODE_RADIUS),
    },
    nodeCenters: displayedCenters,
  };
}
