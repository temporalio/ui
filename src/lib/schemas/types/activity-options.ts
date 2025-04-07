import { z } from 'zod';

export const ActivityOptions = z.object({
  taskQueue: z.any().optional(),
  /**
   * Indicates how long the caller is willing to wait for an activity completion. Limits how long
   *  retries will be attempted. Either this or `start_to_close_timeout` must be specified.
   *
   *  (-- api-linter: core::0140::prepositions=disabled
   *      aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  scheduleToCloseTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'Indicates how long the caller is willing to wait for an activity completion. Limits how long\n retries will be attempted. Either this or `start_to_close_timeout` must be specified.\n\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: "to" is used to indicate interval. --)',
    )
    .optional(),
  /**
   * Limits time an activity task can stay in a task queue before a worker picks it up. This
   *  timeout is always non retryable, as all a retry would achieve is to put it back into the same
   *  queue. Defaults to `schedule_to_close_timeout` or workflow execution timeout if not
   *  specified.
   *
   *  (-- api-linter: core::0140::prepositions=disabled
   *      aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  scheduleToStartTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'Limits time an activity task can stay in a task queue before a worker picks it up. This\n timeout is always non retryable, as all a retry would achieve is to put it back into the same\n queue. Defaults to `schedule_to_close_timeout` or workflow execution timeout if not\n specified.\n\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: "to" is used to indicate interval. --)',
    )
    .optional(),
  /**
   * Maximum time an activity is allowed to execute after being picked up by a worker. This
   *  timeout is always retryable. Either this or `schedule_to_close_timeout` must be
   *  specified.
   *
   *  (-- api-linter: core::0140::prepositions=disabled
   *      aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  startToCloseTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'Maximum time an activity is allowed to execute after being picked up by a worker. This\n timeout is always retryable. Either this or `schedule_to_close_timeout` must be\n specified.\n\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: "to" is used to indicate interval. --)',
    )
    .optional(),
  /**Maximum permitted time between successful worker heartbeats.*/
  heartbeatTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe('Maximum permitted time between successful worker heartbeats.')
    .optional(),
  retryPolicy: z.any().optional(),
});
export type ActivityOptions = z.infer<typeof ActivityOptions>;
