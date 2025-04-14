import { z } from 'zod';

export const ChildWorkflowExecutionTimedOutEventAttributes = z.object({
  /**
   * Namespace of the child workflow.
   *  SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.
   */
  namespace: z
    .string()
    .describe(
      'Namespace of the child workflow.\n SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.',
    )
    .optional(),
  namespaceId: z.string().optional(),
  workflowExecution: z.any().optional(),
  workflowType: z.any().optional(),
  /**Id of the `START_CHILD_WORKFLOW_EXECUTION_INITIATED` event which this event corresponds to*/
  initiatedEventId: z
    .string()
    .describe(
      'Id of the `START_CHILD_WORKFLOW_EXECUTION_INITIATED` event which this event corresponds to',
    )
    .optional(),
  /**Id of the `CHILD_WORKFLOW_EXECUTION_STARTED` event which this event corresponds to*/
  startedEventId: z
    .string()
    .describe(
      'Id of the `CHILD_WORKFLOW_EXECUTION_STARTED` event which this event corresponds to',
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
export type ChildWorkflowExecutionTimedOutEventAttributes = z.infer<
  typeof ChildWorkflowExecutionTimedOutEventAttributes
>;
