import type { ActivityOptions } from '$lib/types';

export const ACTIVITY_OPTIONS_UPDATE_PATHS = [
  'taskQueue.name',
  'scheduleToCloseTimeout',
  'scheduleToStartTimeout',
  'startToCloseTimeout',
  'heartbeatTimeout',
  'retryPolicy.initialInterval',
  'retryPolicy.backoffCoefficient',
  'retryPolicy.maximumInterval',
  'retryPolicy.maximumAttempts',
] as const;

const OPTIONAL_ACTIVITY_OPTIONS_UPDATE_PATHS = ['startDelay'] as const;

const valueAtPath = (source: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce(
      (value, key) =>
        value === null || value === undefined
          ? undefined
          : (value as Record<string, unknown>)[key],
      source,
    );

const hasValue = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

export const activityOptionsUpdateMask = (
  activityOptions: ActivityOptions | null | undefined,
  optionalPaths: readonly string[] = OPTIONAL_ACTIVITY_OPTIONS_UPDATE_PATHS,
): string =>
  [
    ...ACTIVITY_OPTIONS_UPDATE_PATHS,
    ...optionalPaths.filter((path) =>
      hasValue(valueAtPath(activityOptions, path)),
    ),
  ].join(',');
