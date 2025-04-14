import { z } from 'zod';

/**
 * IntervalSpec matches times that can be expressed as:
 *  epoch + n * interval + phase
 *  where n is an integer.
 *  phase defaults to zero if missing. interval is required.
 *  Both interval and phase must be non-negative and are truncated to the nearest
 *  second before any calculations.
 *  For example, an interval of 1 hour with phase of zero would match every hour,
 *  on the hour. The same interval but a phase of 19 minutes would match every
 *  xx:19:00. An interval of 28 days with phase zero would match
 *  2022-02-17T00:00:00Z (among other times). The same interval with a phase of 3
 *  days, 5 hours, and 23 minutes would match 2022-02-20T05:23:00Z instead.
 */
export const IntervalSpec = z
  .object({
    interval: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .optional(),
    phase: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .optional(),
  })
  .describe(
    'IntervalSpec matches times that can be expressed as:\n epoch + n * interval + phase\n where n is an integer.\n phase defaults to zero if missing. interval is required.\n Both interval and phase must be non-negative and are truncated to the nearest\n second before any calculations.\n For example, an interval of 1 hour with phase of zero would match every hour,\n on the hour. The same interval but a phase of 19 minutes would match every\n xx:19:00. An interval of 28 days with phase zero would match\n 2022-02-17T00:00:00Z (among other times). The same interval with a phase of 3\n days, 5 hours, and 23 minutes would match 2022-02-20T05:23:00Z instead.',
  );
export type IntervalSpec = z.infer<typeof IntervalSpec>;
