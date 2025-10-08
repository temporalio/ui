export const getExponentialBackoff = (
  initialIntervalSeconds: number,
  attempt: number,
): number => {
  if (attempt <= 1) return initialIntervalSeconds * 1000;
  const maxIntervalSeconds = 300;
  const growthMultiplier = 1.2; // Gentler 30% growth per attempt
  const exponentialBackoff =
    initialIntervalSeconds * Math.pow(growthMultiplier, attempt - 1);
  const intervalSeconds = Math.min(
    maxIntervalSeconds,
    Math.round(exponentialBackoff),
  );
  return intervalSeconds * 1000;
};
