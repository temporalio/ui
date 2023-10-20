export const getExpotentialBackoffSeconds = (
  initialIntervalSeconds: number,
  attempt: number,
): number => {
  const maxIntervalSeconds = 3600;
  const maxAttempts = 100;
  const growthFactor = Math.pow(
    maxIntervalSeconds / initialIntervalSeconds,
    1 / maxAttempts,
  );
  const expotentialBackoff =
    initialIntervalSeconds * Math.pow(growthFactor, attempt);
  const intervalSeconds = Math.min(
    maxIntervalSeconds,
    Math.round(expotentialBackoff),
  );
  return intervalSeconds;
};
