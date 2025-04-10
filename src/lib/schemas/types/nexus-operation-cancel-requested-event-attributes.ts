import { z } from 'zod';

export const NexusOperationCancelRequestedEventAttributes = z.object({
  /**The id of the `NEXUS_OPERATION_SCHEDULED` event this cancel request corresponds to.*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `NEXUS_OPERATION_SCHEDULED` event this cancel request corresponds to.',
    )
    .optional(),
  /**
   * The `WORKFLOW_TASK_COMPLETED` event that the corresponding RequestCancelNexusOperation command was reported
   *  with.
   */
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event that the corresponding RequestCancelNexusOperation command was reported\n with.',
    )
    .optional(),
});
export type NexusOperationCancelRequestedEventAttributes = z.infer<
  typeof NexusOperationCancelRequestedEventAttributes
>;
