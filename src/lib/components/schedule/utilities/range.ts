import type { RangeSpec } from '$lib/types';

function expandRange(range: RangeSpec): number[] {
  const start = range.start ?? 0;
  const end = range.end ?? start;
  const step = range.step && range.step > 0 ? range.step : 1;

  if (end <= start) return [start];

  const values: number[] = [];
  for (let i = start; i <= end; i += step) {
    values.push(i);
  }

  return values;
}

export function expandRanges(ranges: RangeSpec[] | undefined | null): number[] {
  if (!ranges || ranges.length === 0) return [];

  const expandedSet = new Set<number>();

  for (const range of ranges) {
    for (const v of expandRange(range)) {
      expandedSet.add(v);
    }
  }
  return Array.from(expandedSet).sort((a, b) => a - b);
}
