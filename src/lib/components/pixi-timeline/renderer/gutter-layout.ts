/**
 * Pure geometry for gutter pin icon placement.
 *
 * Sprite anchor is always (0, 0.5) — left edge, vertical center.
 * All returned values are in Pixi canvas-space pixels.
 */
export type GutterIconLayout = {
  /** Left edge of the sprite (anchor.x = 0) */
  x: number;
  /** Vertical center of the sprite (anchor.y = 0.5) */
  y: number;
  /** Square side length for both width and height */
  size: number;
};

/**
 * Compute the position and size for an icon centered inside a gutter pin bar.
 *
 * @param px   Left edge of the pin bar
 * @param py   Top edge of the pin bar
 * @param pw   Width of the pin bar
 * @param pinH Height of the pin bar
 */
export function gutterIconLayout(
  px: number,
  py: number,
  pw: number,
  pinH: number,
): GutterIconLayout {
  const size = Math.min(pinH - 2, pw - 2);
  return {
    x: px + (pw - size) / 2,
    y: py + pinH / 2,
    size,
  };
}
