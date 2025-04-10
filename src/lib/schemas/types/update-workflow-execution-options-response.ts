import { z } from 'zod';

export const UpdateWorkflowExecutionOptionsResponse = z.object({
  /**Workflow Execution options after update.*/
  workflowExecutionOptions: z
    .any()
    .describe('Workflow Execution options after update.')
    .optional(),
});
export type UpdateWorkflowExecutionOptionsResponse = z.infer<
  typeof UpdateWorkflowExecutionOptionsResponse
>;
