import { z } from 'zod';

export const ExternalWorkflowExecutionSignaledEventAttributes = z.object({
  /**id of the `SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED` event this event corresponds to*/
  initiatedEventId: z
    .string()
    .describe(
      'id of the `SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED` event this event corresponds to',
    )
    .optional(),
  /**
   * Namespace of the workflow which was signaled.
   *  SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.
   */
  namespace: z
    .string()
    .describe(
      'Namespace of the workflow which was signaled.\n SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.',
    )
    .optional(),
  namespaceId: z.string().optional(),
  workflowExecution: z.any().optional(),
  /**Deprecated*/
  control: z.string().describe('Deprecated').optional(),
});
export type ExternalWorkflowExecutionSignaledEventAttributes = z.infer<
  typeof ExternalWorkflowExecutionSignaledEventAttributes
>;
