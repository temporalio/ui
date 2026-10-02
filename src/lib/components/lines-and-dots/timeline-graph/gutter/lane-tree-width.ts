import {
  LANE_EDGE_INSET,
  LANE_TREE_MAX_FRACTION,
  LANE_TREE_MIN_WIDTH,
  LANE_TREE_WIDTH,
} from '../constants';

/**
 * Widest the tree may be in a view of the given width. Until the view has
 * been measured there is nothing to protect, so only the minimum applies.
 */
export const maxLaneTreeWidth = (containerWidth: number): number =>
  containerWidth > 0
    ? Math.max(
        LANE_TREE_MIN_WIDTH,
        Math.floor(containerWidth * LANE_TREE_MAX_FRACTION),
      )
    : Infinity;

/**
 * The width the tree is drawn at: the user's choice, or the default, kept
 * within bounds so a width saved on a wide screen can't crowd out the plot on
 * a narrow one.
 */
export const clampLaneTreeWidth = (
  width: number | null | undefined,
  containerWidth: number,
): number =>
  Math.round(
    Math.min(
      maxLaneTreeWidth(containerWidth),
      Math.max(LANE_TREE_MIN_WIDTH, width ?? LANE_TREE_WIDTH),
    ),
  );

/**
 * Space at either end of the plot. Beside the tree, time runs edge to edge,
 * as anything on the first or last instant is drawn inwards from it; without
 * the tree the plot keeps an inset off the container's border on both sides.
 */
export const laneEdgeInsetPx = (treeWidth: number): number =>
  treeWidth > 0 ? 0 : LANE_EDGE_INSET;

/** Distance from a Lanes shell's left edge to time zero. */
export const laneTimeOriginPx = (treeWidth: number): number =>
  treeWidth + laneEdgeInsetPx(treeWidth);
