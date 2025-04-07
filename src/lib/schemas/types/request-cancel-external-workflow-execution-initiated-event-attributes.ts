import { z } from 'zod';

export const RequestCancelExternalWorkflowExecutionInitiatedEventAttributes =
  z.object({
    /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
    workflowTaskCompletedEventId: z
      .string()
      .describe(
        'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
      )
      .optional(),
    /**
     * The namespace the workflow to be cancelled lives in.
     *  SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.
     */
    namespace: z
      .string()
      .describe(
        'The namespace the workflow to be cancelled lives in.\n SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.',
      )
      .optional(),
    namespaceId: z.string().optional(),
    workflowExecution: z.any().optional(),
    /**Deprecated*/
    control: z.string().describe('Deprecated').optional(),
    /**
     * Workers are expected to set this to true if the workflow they are requesting to cancel is
     *  a child of the workflow which issued the request
     */
    childWorkflowOnly: z
      .boolean()
      .describe(
        'Workers are expected to set this to true if the workflow they are requesting to cancel is\n a child of the workflow which issued the request',
      )
      .optional(),
    /**Reason for requesting the cancellation*/
    reason: z
      .string()
      .describe('Reason for requesting the cancellation')
      .optional(),
  });
export type RequestCancelExternalWorkflowExecutionInitiatedEventAttributes =
  z.infer<
    typeof RequestCancelExternalWorkflowExecutionInitiatedEventAttributes
  >;
