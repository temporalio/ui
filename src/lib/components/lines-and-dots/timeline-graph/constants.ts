const BASE_RADIUS = 6;
export const ROW_HEIGHT = BASE_RADIUS * 4;
export const GUTTER = BASE_RADIUS * 8;
export const RADIUS = BASE_RADIUS * 1.5;
export const DOT_STROKE = 2;

/** Default width of the Lanes tree column, until the user resizes it. */
export const LANE_TREE_WIDTH = 500;
/** Narrowest tree that still shows a marker, an icon and a short label. */
export const LANE_TREE_MIN_WIDTH = 240;
/** The tree never takes more than this share of the view from the plot. */
export const LANE_TREE_MAX_FRACTION = 0.6;
/** Space between the top of the Lanes timeline and its first row. */
export const LANE_TOP_GAP_PX = 4;
/** Space between the Lanes timeline's last row and its time labels. */
export const LANE_BOTTOM_GAP_PX = 8;
/**
 * The fewest rows of height the Lanes plot takes, so a workflow with only a
 * few events doesn't squash the plot or the details panel beside it.
 */
export const LANE_MIN_PLOT_ROWS = 12;
/** Space between the Lanes tree's left edge and its first column. */
export const LANE_TREE_ROW_PAD_PX = 4;
/**
 * The tree's figures columns, flush with its right edge. They hold the same
 * spacing as the rest of a row: 8px between columns and before the edge.
 */
export const LANE_DURATION_COLUMN_PX = 80;
export const LANE_RETRIES_COLUMN_PX = 40;
export const LANE_TREE_COLUMN_GAP_PX = 8;
/** Default width of the Lanes event details panel. */
export const LANE_DETAILS_WIDTH = 480;
/** Narrowest panel whose fields and payloads still read comfortably. */
export const LANE_DETAILS_MIN_WIDTH = 320;
/** The panel never takes more than this share of the timeline's row. */
export const LANE_DETAILS_MAX_FRACTION = 0.5;
/**
 * Inset at either end of the Lanes plot. Time runs edge to edge, keeping only
 * half a dot's width so a marker on the first or last instant isn't cut off.
 */
export const LANE_EDGE_INSET = (2 * RADIUS + DOT_STROKE) / 2;
/**
 * Lanes rows hold one line in the tree — the rest of a row's identity waits
 * in its hover card — so a row is its 20px icon and text with 4px either
 * side. That leaves 8px between neighbouring rows, enough for each to read as
 * its own item. Everything vertical in that view scales from this.
 */
export const LANE_ROW_HEIGHT = 28;
