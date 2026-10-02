import {
  LANE_DETAILS_MAX_FRACTION,
  LANE_DETAILS_MIN_WIDTH,
  LANE_DETAILS_WIDTH,
} from './constants';

/**
 * Widest the details panel may be beside a timeline of the given width.
 * Before the row has been measured only the minimum applies.
 */
export const maxLaneDetailsWidth = (rowWidth: number): number =>
  rowWidth > 0
    ? Math.max(
        LANE_DETAILS_MIN_WIDTH,
        Math.floor(rowWidth * LANE_DETAILS_MAX_FRACTION),
      )
    : Infinity;

/** The width the panel is drawn at: the user's choice or the default. */
export const clampLaneDetailsWidth = (
  width: number | null | undefined,
  rowWidth: number,
): number =>
  Math.round(
    Math.min(
      maxLaneDetailsWidth(rowWidth),
      Math.max(LANE_DETAILS_MIN_WIDTH, width ?? LANE_DETAILS_WIDTH),
    ),
  );
