import { z } from 'zod';

export const WorkflowExecutionCompletedEventAttributes = z.object({
  /**Serialized result of workflow completion (ie: The return value of the workflow function)*/
  result: z
    .any()
    .describe(
      'Serialized result of workflow completion (ie: The return value of the workflow function)',
    )
    .optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  /**If another run is started by cron, this contains the new run id.*/
  newExecutionRunId: z
    .string()
    .describe(
      'If another run is started by cron, this contains the new run id.',
    )
    .optional(),
});
export type WorkflowExecutionCompletedEventAttributes = z.infer<
  typeof WorkflowExecutionCompletedEventAttributes
>;
