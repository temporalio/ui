import { z } from 'zod';

export const ActivityTaskTimedOutEventAttributes = z.object({
  /**
   * If this activity had failed, was retried, and then timed out, that failure is stored as the
   *  `cause` in here.
   */
  failure: z
    .any()
    .describe(
      'If this activity had failed, was retried, and then timed out, that failure is stored as the\n `cause` in here.',
    )
    .optional(),
  /**The id of the `ACTIVITY_TASK_SCHEDULED` event this timeout corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_SCHEDULED` event this timeout corresponds to',
    )
    .optional(),
  /**The id of the `ACTIVITY_TASK_STARTED` event this timeout corresponds to*/
  startedEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_STARTED` event this timeout corresponds to',
    )
    .optional(),
  retryState: z
    .enum([
      'RETRY_STATE_UNSPECIFIED',
      'RETRY_STATE_IN_PROGRESS',
      'RETRY_STATE_NON_RETRYABLE_FAILURE',
      'RETRY_STATE_TIMEOUT',
      'RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED',
      'RETRY_STATE_RETRY_POLICY_NOT_SET',
      'RETRY_STATE_INTERNAL_SERVER_ERROR',
      'RETRY_STATE_CANCEL_REQUESTED',
    ])
    .optional(),
});
export type ActivityTaskTimedOutEventAttributes = z.infer<
  typeof ActivityTaskTimedOutEventAttributes
>;
