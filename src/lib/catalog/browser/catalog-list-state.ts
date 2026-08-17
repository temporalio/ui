export type PendingRunCounts = Readonly<Record<string, number>>;

export const changePendingRunCount = (
  counts: PendingRunCounts,
  exampleId: string,
  change: 1 | -1,
): PendingRunCounts => {
  const nextCount = Math.max(0, (counts[exampleId] ?? 0) + change);
  const nextCounts = { ...counts };

  if (nextCount === 0) {
    delete nextCounts[exampleId];
  } else {
    nextCounts[exampleId] = nextCount;
  }

  return nextCounts;
};
