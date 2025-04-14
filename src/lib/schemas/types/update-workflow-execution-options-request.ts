import { z } from 'zod';

export const UpdateWorkflowExecutionOptionsRequest = z.object({
  /**The namespace name of the target Workflow.*/
  namespace: z
    .string()
    .describe('The namespace name of the target Workflow.')
    .optional(),
  /**
   * The target Workflow Id and (optionally) a specific Run Id thereof.
   *  (-- api-linter: core::0203::optional=disabled
   *      aip.dev/not-precedent: false positive triggered by the word "optional" --)
   */
  workflowExecution: z
    .any()
    .describe(
      'The target Workflow Id and (optionally) a specific Run Id thereof.\n (-- api-linter: core::0203::optional=disabled\n     aip.dev/not-precedent: false positive triggered by the word "optional" --)',
    )
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
});
export type UpdateWorkflowExecutionOptionsRequest = z.infer<
  typeof UpdateWorkflowExecutionOptionsRequest
>;
