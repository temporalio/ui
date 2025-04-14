import { z } from 'zod';

export const ActivityTaskFailedEventAttributes = z.object({
  /**Failure details*/
  failure: z.any().describe('Failure details').optional(),
  /**The id of the `ACTIVITY_TASK_SCHEDULED` event this failure corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_SCHEDULED` event this failure corresponds to',
    )
    .optional(),
  /**The id of the `ACTIVITY_TASK_STARTED` event this failure corresponds to*/
  startedEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_STARTED` event this failure corresponds to',
    )
    .optional(),
  /**id of the worker that failed this task*/
  identity: z
    .string()
    .describe('id of the worker that failed this task')
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
  /**
   * Version info of the worker who processed this workflow task.
   *  Deprecated. Use the info inside the corresponding ActivityTaskStartedEvent
   */
  workerVersion: z
    .any()
    .describe(
      'Version info of the worker who processed this workflow task.\n Deprecated. Use the info inside the corresponding ActivityTaskStartedEvent',
    )
    .optional(),
});
export type ActivityTaskFailedEventAttributes = z.infer<
  typeof ActivityTaskFailedEventAttributes
>;
