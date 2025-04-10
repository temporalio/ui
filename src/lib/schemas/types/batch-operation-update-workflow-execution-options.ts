import { z } from 'zod';

/**
 * BatchOperationUpdateWorkflowExecutionOptions sends UpdateWorkflowExecutionOptions requests to batch workflows.
 *  Keep the parameters in sync with temporal.api.workflowservice.v1.UpdateWorkflowExecutionOptionsRequest.
 */
export const BatchOperationUpdateWorkflowExecutionOptions = z
  .object({
    /**The identity of the worker/client.*/
    identity: z
      .string()
      .describe('The identity of the worker/client.')
      .optional(),
    /**Workflow Execution options. Partial updates are accepted and controlled by update_mask.*/
    workflowExecutionOptions: z
      .any()
      .describe(
        'Workflow Execution options. Partial updates are accepted and controlled by update_mask.',
      )
      .optional(),
    /**
     * Controls which fields from `workflow_execution_options` will be applied.
     *  To unset a field, set it to null and use the update mask to indicate that it should be mutated.
     */
    updateMask: z
      .string()
      .describe(
        'Controls which fields from `workflow_execution_options` will be applied.\n To unset a field, set it to null and use the update mask to indicate that it should be mutated.',
      )
      .optional(),
  })
  .describe(
    'BatchOperationUpdateWorkflowExecutionOptions sends UpdateWorkflowExecutionOptions requests to batch workflows.\n Keep the parameters in sync with temporal.api.workflowservice.v1.UpdateWorkflowExecutionOptionsRequest.',
  );
export type BatchOperationUpdateWorkflowExecutionOptions = z.infer<
  typeof BatchOperationUpdateWorkflowExecutionOptions
>;
