import { z } from 'zod';

export const WorkflowPropertiesModifiedEventAttributes = z.object({
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  /**
   * If set, update the workflow memo with the provided values. The values will be merged with
   *  the existing memo. If the user wants to delete values, a default/empty Payload should be
   *  used as the value for the key being deleted.
   */
  upsertedMemo: z
    .any()
    .describe(
      'If set, update the workflow memo with the provided values. The values will be merged with\n the existing memo. If the user wants to delete values, a default/empty Payload should be\n used as the value for the key being deleted.',
    )
    .optional(),
});
export type WorkflowPropertiesModifiedEventAttributes = z.infer<
  typeof WorkflowPropertiesModifiedEventAttributes
>;
