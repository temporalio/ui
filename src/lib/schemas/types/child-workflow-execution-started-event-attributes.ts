import { z } from 'zod';

export const ChildWorkflowExecutionStartedEventAttributes = z.object({
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
  /**Id of the `START_CHILD_WORKFLOW_EXECUTION_INITIATED` event which this event corresponds to*/
  initiatedEventId: z
    .string()
    .describe(
      'Id of the `START_CHILD_WORKFLOW_EXECUTION_INITIATED` event which this event corresponds to',
    )
    .optional(),
  workflowExecution: z.any().optional(),
  workflowType: z.any().optional(),
  header: z.any().optional(),
});
export type ChildWorkflowExecutionStartedEventAttributes = z.infer<
  typeof ChildWorkflowExecutionStartedEventAttributes
>;
