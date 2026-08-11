/**
 * Sorts that never move row data — they permute a Uint32Array of row indices.
 *
 * Every pass is stable, so a multi-key sort is just successive passes applied
 * from the least significant key to the most significant. That is why three
 * keys cost about what one does.
 */

export type SortDirection = 'asc' | 'desc';

const RADIX = 256;
const WORD = 4294967296; // 2^32

/**
 * Counting sort on a dictionary-encoded column. One pass, no comparisons.
 */
export const countingSortU8 = (
  order: Uint32Array,
  scratch: Uint32Array,
  keys: Uint8Array,
  direction: SortDirection,
): void => {
  const n = order.length;
  const counts = new Uint32Array(RADIX);

  for (let i = 0; i < n; i++) counts[keys[order[i]]]++;

  let total = 0;
  if (direction === 'desc') {
    for (let value = RADIX - 1; value >= 0; value--) {
      const c = counts[value];
      counts[value] = total;
      total += c;
    }
  } else {
    for (let value = 0; value < RADIX; value++) {
      const c = counts[value];
      counts[value] = total;
      total += c;
    }
  }

  for (let i = 0; i < n; i++) scratch[counts[keys[order[i]]]++] = order[i];
  order.set(scratch);
};

/**
 * LSD radix over epoch-millisecond timestamps.
 *
 * Milliseconds do not fit in 32 bits, and truncating to seconds silently loses
 * ordering between rows that start in the same second — at 12M rows over a
 * month that is several rows every second. So keys are rebased to the minimum
 * timestamp and the pass count is derived from the actual span, which keeps
 * exact millisecond ordering while doing the fewest passes that span needs.
 *
 * `nullValue` rows (no close time, i.e. still running) always sort last,
 * regardless of direction — they are absent, not zero.
 */
export const radixSortTimestamps = (
  order: Uint32Array,
  scratch: Uint32Array,
  values: Float64Array,
  direction: SortDirection,
  nullValue = 0,
): void => {
  const n = order.length;
  if (n === 0) return;

  let min = Infinity;
  let max = -Infinity;
  let nulls = 0;
  for (let i = 0; i < n; i++) {
    const value = values[order[i]];
    if (value === nullValue) {
      nulls++;
      continue;
    }
    if (value < min) min = value;
    if (value > max) max = value;
  }

  if (nulls === n) return; // nothing but nulls; order already stable

  const span = max - min;
  const passes = Math.max(1, Math.ceil(Math.log2(span + 1) / 8));
  const counts = new Uint32Array(RADIX);

  // Rebase into a plain array of low/high 32-bit halves so digit extraction is
  // integer work rather than repeated float division.
  const rows = values.length;
  const lo = new Uint32Array(rows);
  const hi = new Uint32Array(rows);
  for (let i = 0; i < rows; i++) {
    const raw = values[i];
    const key = raw === nullValue ? 0 : raw - min;
    lo[i] = key >>> 0;
    hi[i] = Math.floor(key / WORD);
  }

  const digitOf = (row: number, pass: number) => {
    const shift = (pass % 4) * 8;
    const word = pass < 4 ? lo[row] : hi[row];
    const digit = (word >>> shift) & 255;
    return direction === 'desc' ? 255 - digit : digit;
  };

  for (let pass = 0; pass < passes; pass++) {
    counts.fill(0);
    for (let i = 0; i < n; i++) counts[digitOf(order[i], pass)]++;

    let total = 0;
    for (let value = 0; value < RADIX; value++) {
      const c = counts[value];
      counts[value] = total;
      total += c;
    }

    for (let i = 0; i < n; i++) {
      const row = order[i];
      scratch[counts[digitOf(row, pass)]++] = row;
    }
    order.set(scratch);
  }

  if (nulls === 0) return;

  // Stable partition: present values keep their sorted order, absent ones fall
  // to the end keeping theirs. Applied last so it wins over direction.
  let write = 0;
  for (let i = 0; i < n; i++) {
    if (values[order[i]] !== nullValue) scratch[write++] = order[i];
  }
  for (let i = 0; i < n; i++) {
    if (values[order[i]] === nullValue) scratch[write++] = order[i];
  }
  order.set(scratch);
};

/**
 * MSD radix over fixed-width packed strings, recursing only into buckets that
 * are still tied. Workflow IDs share a long type prefix, so the first several
 * bytes discriminate nothing and the recursion is what skips past them without
 * a comparison sort.
 */
export const msdRadixSortStrings = (
  order: Uint32Array,
  scratch: Uint32Array,
  bytes: Uint8Array,
  width: number,
  direction: SortDirection,
): void => {
  const counts = new Uint32Array(RADIX + 1);

  const digitAt = (row: number, depth: number) => {
    const byte = bytes[row * width + depth];
    return direction === 'desc' ? 255 - byte : byte;
  };

  // Explicit stack rather than recursion: `counts` is reused every level, so a
  // recursive call would overwrite the bucket boundaries its caller still needs
  // for the buckets it has not descended into yet.
  const stack: number[] = [0, order.length, 0];

  while (stack.length) {
    const depth = stack.pop() as number;
    const to = stack.pop() as number;
    const from = stack.pop() as number;
    if (depth >= width || to - from <= 1) continue;

    counts.fill(0);
    for (let i = from; i < to; i++) counts[digitAt(order[i], depth) + 1]++;

    // this byte discriminates nothing — skip it without a scatter
    let nonEmpty = 0;
    for (let value = 1; value <= RADIX; value++) if (counts[value]) nonEmpty++;
    if (nonEmpty <= 1) {
      stack.push(from, to, depth + 1);
      continue;
    }

    for (let value = 0; value < RADIX; value++)
      counts[value + 1] += counts[value];

    // capture boundaries before the scatter mutates counts
    const bounds: number[] = [];
    for (let value = 0; value < RADIX; value++) {
      const bucketFrom = from + counts[value];
      const bucketTo = from + counts[value + 1];
      if (bucketTo - bucketFrom > 1) bounds.push(bucketFrom, bucketTo);
    }

    for (let i = from; i < to; i++) {
      const row = order[i];
      scratch[from + counts[digitAt(row, depth)]++] = row;
    }
    for (let i = from; i < to; i++) order[i] = scratch[i];

    for (let i = 0; i < bounds.length; i += 2) {
      stack.push(bounds[i], bounds[i + 1], depth + 1);
    }
  }
};
