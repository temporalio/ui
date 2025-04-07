import { z } from 'zod';

export const ChildWorkflowExecutionCanceledEventAttributes = z.object({
  details: z.any().optional(),
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
});
export type ChildWorkflowExecutionCanceledEventAttributes = z.infer<
  typeof ChildWorkflowExecutionCanceledEventAttributes
>;
