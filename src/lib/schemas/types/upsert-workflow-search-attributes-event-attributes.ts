import { z } from 'zod';

export const UpsertWorkflowSearchAttributesEventAttributes = z.object({
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  searchAttributes: z.any().optional(),
});
export type UpsertWorkflowSearchAttributesEventAttributes = z.infer<
  typeof UpsertWorkflowSearchAttributesEventAttributes
>;
