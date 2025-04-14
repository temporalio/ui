import { z } from 'zod';

export const ActivityTaskCancelRequestedEventAttributes = z.object({
  /**The id of the `ACTIVITY_TASK_SCHEDULED` event this cancel request corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_SCHEDULED` event this cancel request corresponds to',
    )
    .optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
});
export type ActivityTaskCancelRequestedEventAttributes = z.infer<
  typeof ActivityTaskCancelRequestedEventAttributes
>;
