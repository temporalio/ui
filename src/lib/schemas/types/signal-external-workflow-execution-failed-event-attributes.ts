import { z } from 'zod';

export const SignalExternalWorkflowExecutionFailedEventAttributes = z.object({
  cause: z
    .enum([
      'SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED',
      'SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED_CAUSE_EXTERNAL_WORKFLOW_EXECUTION_NOT_FOUND',
      'SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED_CAUSE_NAMESPACE_NOT_FOUND',
      'SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED_CAUSE_SIGNAL_COUNT_LIMIT_EXCEEDED',
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
   * Namespace of the workflow which failed the signal.
   *  SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.
   */
  namespace: z
    .string()
    .describe(
      'Namespace of the workflow which failed the signal.\n SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.',
    )
    .optional(),
  namespaceId: z.string().optional(),
  workflowExecution: z.any().optional(),
  initiatedEventId: z.string().optional(),
  /**Deprecated*/
  control: z.string().describe('Deprecated').optional(),
});
export type SignalExternalWorkflowExecutionFailedEventAttributes = z.infer<
  typeof SignalExternalWorkflowExecutionFailedEventAttributes
>;
