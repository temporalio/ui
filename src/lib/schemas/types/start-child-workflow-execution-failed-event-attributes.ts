import { z } from 'zod';

export const StartChildWorkflowExecutionFailedEventAttributes = z.object({
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
  workflowId: z.string().optional(),
  workflowType: z.any().optional(),
  cause: z
    .enum([
      'START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED',
      'START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS',
      'START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_NAMESPACE_NOT_FOUND',
    ])
    .optional(),
  /**Deprecated*/
  control: z.string().describe('Deprecated').optional(),
  /**Id of the `START_CHILD_WORKFLOW_EXECUTION_INITIATED` event which this event corresponds to*/
  initiatedEventId: z
    .string()
    .describe(
      'Id of the `START_CHILD_WORKFLOW_EXECUTION_INITIATED` event which this event corresponds to',
    )
    .optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
});
export type StartChildWorkflowExecutionFailedEventAttributes = z.infer<
  typeof StartChildWorkflowExecutionFailedEventAttributes
>;
