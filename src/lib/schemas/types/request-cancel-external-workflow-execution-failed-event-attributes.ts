import { z } from 'zod';

export const RequestCancelExternalWorkflowExecutionFailedEventAttributes =
  z.object({
    cause: z
      .enum([
        'CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED',
        'CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED_CAUSE_EXTERNAL_WORKFLOW_EXECUTION_NOT_FOUND',
        'CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED_CAUSE_NAMESPACE_NOT_FOUND',
      ])
      .optional(),
    /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
    workflowTaskCompletedEventId: z
      .string()
      .describe(
        'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
      )
      .optional(),
    /**
     * Namespace of the workflow which failed to cancel.
     *  SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.
     */
    namespace: z
      .string()
      .describe(
        'Namespace of the workflow which failed to cancel.\n SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.',
      )
      .optional(),
    namespaceId: z.string().optional(),
    workflowExecution: z.any().optional(),
    /**
     * id of the `REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED` event this failure
     *  corresponds to
     */
    initiatedEventId: z
      .string()
      .describe(
        'id of the `REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED` event this failure\n corresponds to',
      )
      .optional(),
    /**Deprecated*/
    control: z.string().describe('Deprecated').optional(),
  });
export type RequestCancelExternalWorkflowExecutionFailedEventAttributes =
  z.infer<typeof RequestCancelExternalWorkflowExecutionFailedEventAttributes>;
