/**
 * Pure, side-effect-free layout for top/bottom gutter pins.
 *
 * Each pin's horizontal position reflects the event's actual position within
 * the current viewport.  Events that fall outside the visible time window are
 * clamped to the left or right edge so the user always sees "there are events
 * here, and they're to the left/right of your current view."
 *
 * In a bidirectional (desc-top / asc-bottom) layout this means:
 *   - Top gutter (newest/desc tracks): pins cluster on the RIGHT.
 *   - Bottom gutter (oldest/asc tracks): pins cluster on the LEFT.
 * The top-left and bottom-right gutter areas will therefore be empty — which
 * is the correct invariant for this layout.
 *
 * Row-packing (up to maxRows) handles overlap without dropping events.
 */

export interface GutterPinInput {
  startMs: number;
  endMs: number;
}

export interface PlacedGutterPin<T extends GutterPinInput = GutterPinInput> {
  event: T;
  row: number;
  px: number;
  pw: number;
}

export interface GutterPinLayoutParams {
  viewStartMs: number;
  viewEndMs: number;
  zoom: number;
  screenW: number;
  pinMargin: number;
  minPinW: number;
  maxRows: number;
}

/**
 * Compute the px/pw/row placement for a list of gutter pin events.
 *
 * Every event produces a pin — events before the viewport go to the left edge,
 * events after the viewport go to the right edge, and events within the
 * viewport go to their actual time position.
 *
 * Row-packing: each event is placed in the first row where its pin doesn't
 * overlap the previous pin.  Excess events (all rows full at that x) are
 * skipped.
 *
 * @returns One entry per placed event (in the same order as `events`).
 */
export function layoutGutterPins<T extends GutterPinInput>(
  events: T[],
  params: GutterPinLayoutParams,
): PlacedGutterPin<T>[] {
  const { viewStartMs, viewEndMs, zoom, screenW, pinMargin, minPinW, maxRows } =
    params;

  const rowEndX: number[] = [];
  const placed: PlacedGutterPin<T>[] = [];

  for (const ev of events) {
    // Clamp start/end to viewport so out-of-range events snap to the edges.
    const msStart = Math.max(ev.startMs, viewStartMs);
    const msEnd = Math.min(ev.endMs, viewEndMs);

    // Raw pixel coordinates relative to the viewport left edge.
    const rawPx = (msStart - viewStartMs) * zoom;
    // For events entirely before the viewport msStart == msEnd == viewStartMs → rawEnd == 0.
    // For events entirely after the viewport msStart == msEnd == viewEndMs → rawEnd == screenW.
    const rawEnd = (msEnd - viewStartMs) * zoom;

    const px = Math.max(
      pinMargin,
      Math.min(screenW - pinMargin - minPinW, rawPx),
    );
    const pw = Math.max(
      minPinW,
      Math.min(screenW - pinMargin - px, Math.max(0, rawEnd - rawPx)),
    );

    let row = -1;
    for (let r = 0; r < rowEndX.length; r++) {
      if (px >= rowEndX[r] + 1) {
        row = r;
        break;
      }
    }
    if (row === -1) {
      if (rowEndX.length < maxRows) {
        row = rowEndX.length;
        rowEndX.push(0);
      } else {
        continue;
      }
    }
    rowEndX[row] = px + pw;
    placed.push({ event: ev, row, px, pw });
  }

  return placed;
}
