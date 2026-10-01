const BASE_RADIUS = 6;
export const ROW_HEIGHT = BASE_RADIUS * 4;
export const GUTTER = BASE_RADIUS * 8;
export const RADIUS = BASE_RADIUS * 1.5;
export const DOT_STROKE = 2;

/** Width of the Lanes tree column. */
export const LANE_TREE_WIDTH = 420;
/**
 * Left inset inside the Lanes canvas. The tree column's border is the
 * timeline's origin, so this only leaves room for a dot sitting on zero.
 */
export const LANE_LEFT_GUTTER = RADIUS * 2;
/** Distance from a Lanes shell's left edge to time zero. */
export const LANE_TIME_ORIGIN_PX = LANE_TREE_WIDTH + LANE_LEFT_GUTTER;
/**
 * Lanes rows carry a second line of text in the tree, so they are taller than
 * the shared default. Everything vertical in that view scales from this.
 * A two-line row's text is 30px (14px name, 4px gap, 12px id). 4px either
 * side of it leaves 8px between neighbouring rows — twice the gap inside a
 * row, so each row reads as its own item rather than one continuous column.
 */
export const LANE_ROW_HEIGHT = 38;
