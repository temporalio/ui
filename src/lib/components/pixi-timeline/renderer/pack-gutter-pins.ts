/**
 * Pure, testable gutter pin packing logic — ported from the original Pixi test
 * renderer's `packPins` function.
 *
 * Key design:
 *  - Pin X and width are computed in the **same screen-space formula as event
 *    bars**: `px = (startMs - viewStartMs) * zoom`, `pw = max(minBarW, duration * zoom)`.
 *    This means gutter pins always match the visual width of their bars at the
 *    current zoom level.
 *  - Events entirely off-screen left clamp to the left margin at minBarW wide.
 *  - Events entirely off-screen right clamp to the right margin at minBarW wide.
 *  - Row assignment uses **time-range non-overlap**: two events that do not
 *    overlap in time share a row, maximising pin density without time collision.
 *  - A greedy pixel-space pass within each row skips bars that would visually
 *    overplot an already-drawn bar (longest-duration wins within each row).
 */

export interface PackGutterInput {
  startMs: number;
  endMs: number;
}

export interface PackedGutterPin<T extends PackGutterInput = PackGutterInput> {
  ev: T;
  /** Screen-space left edge of the pin bar (px). */
  px: number;
  /** Width of the pin bar (px), always ≥ minBarW. */
  pw: number;
  /** Row index (0 = closest to the strip edge). */
  row: number;
}

/**
 * Pack off-screen events into gutter pin rows.
 *
 * @param events     Events to pack — **must be sorted longest-duration first**
 *                   so that important events claim space before shorter ones.
 *                   Should already be filtered to those intersecting the
 *                   current horizontal viewport.
 * @param viewStartMs  Left edge of the visible viewport in relative ms.
 * @param zoom         Pixels per ms at the current zoom level.
 * @param screenW      Canvas width in logical pixels.
 * @param pinMargin    Left/right screen margin reserved for edge-pinned bars.
 * @param minBarW      Minimum bar width in pixels (same constant as event bars).
 * @param maxRows      Maximum number of stacked pin rows.
 */
export function packGutterPins<T extends PackGutterInput>(
  events: T[],
  viewStartMs: number,
  zoom: number,
  screenW: number,
  pinMargin: number,
  minBarW: number,
  maxRows: number,
): PackedGutterPin<T>[] {
  if (events.length === 0 || maxRows <= 0) return [];

  type Entry = { ev: T; px: number; pw: number };
  const rows: Entry[][] = [];
  const rowIntervals: [number, number][][] = [];

  // ── Pass 1: row assignment by time-range non-overlap ──────────────────────
  for (const ev of events) {
    const exStart = (ev.startMs - viewStartMs) * zoom;
    const exEnd = exStart + Math.max(minBarW, (ev.endMs - ev.startMs) * zoom);

    let px: number, pw: number;
    if (exEnd < pinMargin) {
      // Entirely off-screen to the left — clamp to left edge.
      px = pinMargin;
      pw = minBarW;
    } else if (exStart > screenW - pinMargin) {
      // Entirely off-screen to the right — clamp to right edge.
      px = screenW - pinMargin - minBarW;
      pw = minBarW;
    } else {
      px = Math.max(pinMargin, exStart);
      pw = Math.max(minBarW, Math.min(screenW - pinMargin, exEnd) - px);
    }

    // Find the first row where this event's time range doesn't overlap.
    let row = -1;
    for (let r = 0; r < rowIntervals.length; r++) {
      if (!rowIntervals[r].some(([s, e]) => ev.startMs < e && ev.endMs > s)) {
        row = r;
        break;
      }
    }
    if (row === -1) {
      if (rowIntervals.length >= maxRows) continue;
      row = rowIntervals.length;
      rowIntervals.push([]);
      rows.push([]);
    }
    rowIntervals[row].push([ev.startMs, ev.endMs]);
    rows[row].push({ ev, px, pw });
  }

  // ── Pass 2: greedy pixel-space deduplication within each row ──────────────
  // Process entries in importance order (the order they were inserted into each
  // row during pass 1, which reflects the collectGutterBest priority sort).
  // This guarantees a high-priority timer always wins over a lower-priority
  // activity at a nearby pixel position.
  const result: PackedGutterPin<T>[] = [];
  for (let r = 0; r < rows.length; r++) {
    const drawnRanges: [number, number][] = [];
    for (const { ev, px, pw } of rows[r]) {
      if (drawnRanges.some(([s, e]) => px < e && px + pw > s)) continue;
      drawnRanges.push([px, px + pw]);
      result.push({ ev, px, pw, row: r });
    }
  }
  return result;
}
