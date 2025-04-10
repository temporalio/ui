import { z } from 'zod';

export const WorkflowExecutionCanceledEventAttributes = z.object({
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  details: z.any().optional(),
});
export type WorkflowExecutionCanceledEventAttributes = z.infer<
  typeof WorkflowExecutionCanceledEventAttributes
>;
