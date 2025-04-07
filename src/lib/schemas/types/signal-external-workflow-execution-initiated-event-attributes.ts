import { z } from 'zod';

export const SignalExternalWorkflowExecutionInitiatedEventAttributes = z.object(
  {
    /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
    workflowTaskCompletedEventId: z
      .string()
      .describe(
        'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
      )
      .optional(),
    /**
     * Namespace of the to-be-signalled workflow.
     *  SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.
     */
    namespace: z
      .string()
      .describe(
        'Namespace of the to-be-signalled workflow.\n SDKs and UI tools should use `namespace` field but server must use `namespace_id` only.',
      )
      .optional(),
    namespaceId: z.string().optional(),
    workflowExecution: z.any().optional(),
    /**name/type of the signal to fire in the external workflow*/
    signalName: z
      .string()
      .describe('name/type of the signal to fire in the external workflow')
      .optional(),
    /**Serialized arguments to provide to the signal handler*/
    input: z
      .any()
      .describe('Serialized arguments to provide to the signal handler')
      .optional(),
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
    header: z.any().optional(),
  },
);
export type SignalExternalWorkflowExecutionInitiatedEventAttributes = z.infer<
  typeof SignalExternalWorkflowExecutionInitiatedEventAttributes
>;
