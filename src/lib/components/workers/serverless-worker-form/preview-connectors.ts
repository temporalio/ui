/**
 * Connector geometry for the Worker Deployment Preview, in real pixels so
 * path lengths are exact and a pulse can travel at one constant speed.
 */

export interface Connector {
  d: string;
  length: number;
}

/** Straight line down the column at `x`. */
export const straightConnector = (x: number, height: number): Connector => ({
  d: `M${x} 0 V${height}`,
  length: height,
});

/**
 * Elbow from `fromX` at the top to `toX` at the bottom, turning at mid-height
 * with rounded corners of `radius`.
 */
export const elbowConnector = (
  fromX: number,
  toX: number,
  height: number,
  radius: number,
): Connector => {
  const dx = toX - fromX;
  if (Math.abs(dx) < 1) return straightConnector(toX, height);
  const r = Math.min(radius, Math.abs(dx) / 2, height / 4);
  const dir = Math.sign(dx);
  const mid = height / 2;
  // Turning toward +x is counter-clockwise first, then clockwise.
  const first = dir > 0 ? 0 : 1;
  const second = dir > 0 ? 1 : 0;
  const d = [
    `M${fromX} 0`,
    `V${mid - r}`,
    `A${r} ${r} 0 0 ${first} ${fromX + dir * r} ${mid}`,
    `H${toX - dir * r}`,
    `A${r} ${r} 0 0 ${second} ${toX} ${mid + r}`,
    `V${height}`,
  ].join(' ');
  const length = height - 4 * r + Math.PI * r + Math.abs(dx);
  return { d, length };
};

export interface PulseTiming {
  /** Seconds for one full cycle, shared by every segment. */
  duration: number;
  /** keyTimes for a segment that starts at `start` px and runs `length` px. */
  keyTimes: (start: number, length: number) => string;
}

/**
 * One cycle moves a pulse of `dash` px along a route of `route` px at
 * `speed` px/s, then rests until `cycle` seconds have passed, so routes of
 * different lengths repeat on the same beat. Each segment animates only
 * while the pulse is over it, so its speed never changes.
 */
export const pulseTiming = (
  route: number,
  dash: number,
  speed: number,
  cycle: number,
): PulseTiming => {
  const duration = Math.max(cycle, (route + dash) / speed);
  const at = (px: number) => Math.min(1, px / speed / duration);
  return {
    duration,
    keyTimes: (start, length) =>
      `0;${at(start)};${at(start + length + dash)};1`,
  };
};
