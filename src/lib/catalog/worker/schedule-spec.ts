import type { ScheduleSpec } from '@temporalio/client';
import type { Duration } from '@temporalio/common';

import type { BrowserScheduleSpec } from '../browser/types.js';

/**
 * Turns a declared spec into the SDK's shape. Kept apart from the reconciler's
 * activities so a caller that only needs to describe a schedule — the startup
 * bootstrap, a deploy step — does not pull a client in with it. Both imports
 * here are type-only, so this module has no runtime dependency at all.
 */
export const toScheduleSpec = ({
  cronExpressions,
  intervals,
}: BrowserScheduleSpec): ScheduleSpec => ({
  ...(cronExpressions ? { cronExpressions: [...cronExpressions] } : {}),
  ...(intervals
    ? {
        intervals: intervals.map(({ every, offset }) => ({
          every: every as Duration,
          ...(offset === undefined ? {} : { offset: offset as Duration }),
        })),
      }
    : {}),
});
