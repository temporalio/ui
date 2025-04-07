import { z } from 'zod';

export const WorkflowExecutionTimedOutEventAttributes = z.object({
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
  /**If another run is started by cron or retry, this contains the new run id.*/
  newExecutionRunId: z
    .string()
    .describe(
      'If another run is started by cron or retry, this contains the new run id.',
    )
    .optional(),
});
export type WorkflowExecutionTimedOutEventAttributes = z.infer<
  typeof WorkflowExecutionTimedOutEventAttributes
>;
