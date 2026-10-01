export type Point = { x: number; y: number };

export type PeelMatrix = [number, number, number, number, number, number];

export type PeelGeometry = {
  front: Point[];
  flap: Point[];
  matrix: PeelMatrix;
};

const IDENTITY: PeelMatrix = [1, 0, 0, 1, 0, 0];

const rectangle = (width: number, height: number): Point[] => [
  { x: 0, y: 0 },
  { x: width, y: 0 },
  { x: width, y: height },
  { x: 0, y: height },
];

const clipToHalfPlane = (
  polygon: Point[],
  distance: (point: Point) => number,
): Point[] =>
  polygon.flatMap((current, index) => {
    const next = polygon[(index + 1) % polygon.length];
    const a = distance(current);
    const b = distance(next);
    const kept = a <= 0 ? [current] : [];
    if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
      const t = a / (a - b);
      return [
        ...kept,
        {
          x: current.x + (next.x - current.x) * t,
          y: current.y + (next.y - current.y) * t,
        },
      ];
    }
    return kept;
  });

export const computePeel = (
  width: number,
  height: number,
  corner: Point,
  pointer: Point,
): PeelGeometry => {
  const rect = rectangle(width, height);
  const dx = corner.x - pointer.x;
  const dy = corner.y - pointer.y;
  const length = Math.hypot(dx, dy);
  if (length < 0.5) return { front: rect, flap: [], matrix: IDENTITY };

  const nx = dx / length;
  const ny = dy / length;
  const mx = (corner.x + pointer.x) / 2;
  const my = (corner.y + pointer.y) / 2;
  const distance = ({ x, y }: Point) => (x - mx) * nx + (y - my) * ny;
  const offset = 2 * (mx * nx + my * ny);

  return {
    front: clipToHalfPlane(rect, distance),
    flap: clipToHalfPlane(rect, (point) => -distance(point)),
    matrix: [
      1 - 2 * nx * nx,
      -2 * nx * ny,
      -2 * nx * ny,
      1 - 2 * ny * ny,
      offset * nx,
      offset * ny,
    ],
  };
};

export const peelProgress = (
  width: number,
  height: number,
  corner: Point,
  pointer: Point,
): number => {
  const diagonal = Math.hypot(width, height);
  if (!diagonal) return 0;
  const travel = Math.hypot(corner.x - pointer.x, corner.y - pointer.y);
  return Math.min(1, travel / (2 * diagonal));
};

export const applyMatrix = (
  [a, b, c, d, e, f]: PeelMatrix,
  { x, y }: Point,
): Point => ({ x: a * x + c * y + e, y: b * x + d * y + f });

export const toClipPath = (points: Point[]): string =>
  points.length
    ? `polygon(${points.map(({ x, y }) => `${x}px ${y}px`).join(', ')})`
    : 'polygon(0 0, 0 0, 0 0)';

export const toMatrix = (matrix: PeelMatrix): string =>
  `matrix(${matrix.join(', ')})`;
