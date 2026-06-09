import type { ScheduleSpecRange } from '../schema/spec-item-form-schema';

function expandRange(range: ScheduleSpecRange): number[] {
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

export function expandRanges(
  ranges: ScheduleSpecRange[] | undefined | null,
): number[] {
  if (!ranges || ranges.length === 0) return [];

  const expandedSet = new Set<number>();

  for (const range of ranges) {
    for (const v of expandRange(range)) {
      expandedSet.add(v);
    }
  }
  return Array.from(expandedSet).sort((a, b) => a - b);
}

// Compact a list of integers into the smallest `Range[]` that expands back to
// the same set. Single arithmetic progressions become one `{start, end, step}`
// entry; otherwise we emit consecutive runs.
export function compactToRanges(values: number[]): ScheduleSpecRange[] {
  const sorted = Array.from(new Set(values)).sort((a, b) => a - b);

  if (!sorted.length) {
    return [];
  }

  if (sorted.length === 1) {
    return [{ start: sorted[0] }];
  }

  const potentialStep = sorted[1] - sorted[0];
  const isArithemticProgression =
    potentialStep > 0 &&
    sorted.every((val, i) => {
      if (i === 0) {
        return true;
      }

      const prevVal = sorted[i - 1];
      return val - prevVal === potentialStep;
    });

  if (isArithemticProgression) {
    const range: ScheduleSpecRange = {
      start: sorted[0],
      end: sorted[sorted.length - 1],
      step: potentialStep === 1 ? undefined : potentialStep,
    };

    return [range];
  }

  const ranges: ScheduleSpecRange[] = [];
  let runStart = sorted[0];
  let runEnd = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === runEnd + 1) {
      runEnd = sorted[i];
      continue;
    }
    ranges.push(
      runStart === runEnd
        ? { start: runStart }
        : { start: runStart, end: runEnd },
    );
    runStart = sorted[i];
    runEnd = sorted[i];
  }
  ranges.push(
    runStart === runEnd
      ? { start: runStart }
      : { start: runStart, end: runEnd },
  );
  return ranges;
}
