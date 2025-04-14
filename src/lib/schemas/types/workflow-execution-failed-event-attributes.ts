import { z } from 'zod';

export const WorkflowExecutionFailedEventAttributes = z.object({
  /**Serialized result of workflow failure (ex: An exception thrown, or error returned)*/
  failure: z
    .any()
    .describe(
      'Serialized result of workflow failure (ex: An exception thrown, or error returned)',
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
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  /**If another run is started by cron or retry, this contains the new run id.*/
  newExecutionRunId: z
    .string()
    .describe(
      'If another run is started by cron or retry, this contains the new run id.',
    )
    .optional(),
});
export type WorkflowExecutionFailedEventAttributes = z.infer<
  typeof WorkflowExecutionFailedEventAttributes
>;
