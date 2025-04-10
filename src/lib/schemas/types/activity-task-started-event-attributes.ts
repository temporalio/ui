import { z } from 'zod';

export const ActivityTaskStartedEventAttributes = z.object({
  /**The id of the `ACTIVITY_TASK_SCHEDULED` event this task corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_SCHEDULED` event this task corresponds to',
    )
    .optional(),
  /**id of the worker that picked up this task*/
  identity: z
    .string()
    .describe('id of the worker that picked up this task')
    .optional(),
  /**TODO ??*/
  requestId: z.string().describe('TODO ??').optional(),
  /**Starting at 1, the number of times this task has been attempted*/
  attempt: z
    .number()
    .int()
    .describe('Starting at 1, the number of times this task has been attempted')
    .optional(),
  /**
   * Will be set to the most recent failure details, if this task has previously failed and then
   *  been retried.
   */
  lastFailure: z
    .any()
    .describe(
      'Will be set to the most recent failure details, if this task has previously failed and then\n been retried.',
    )
    .optional(),
  /**
   * Version info of the worker to whom this task was dispatched.
   *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
   */
  workerVersion: z
    .any()
    .describe(
      'Version info of the worker to whom this task was dispatched.\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
    )
    .optional(),
  /**
   * Used by server internally to properly reapply build ID redirects to an execution
   *  when rebuilding it from events.
   *  Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]
   */
  buildIdRedirectCounter: z
    .string()
    .describe(
      'Used by server internally to properly reapply build ID redirects to an execution\n when rebuilding it from events.\n Deprecated. This field should be cleaned up when versioning-2 API is removed. [cleanup-experimental-wv]',
    )
    .optional(),
});
export type ActivityTaskStartedEventAttributes = z.infer<
  typeof ActivityTaskStartedEventAttributes
>;
