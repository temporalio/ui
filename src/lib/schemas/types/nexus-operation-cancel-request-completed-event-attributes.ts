import { z } from 'zod';

export const NexusOperationCancelRequestCompletedEventAttributes = z.object({
  /**The ID of the `NEXUS_OPERATION_CANCEL_REQUESTED` event.*/
  requestedEventId: z
    .string()
    .describe('The ID of the `NEXUS_OPERATION_CANCEL_REQUESTED` event.')
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
export type NexusOperationCancelRequestCompletedEventAttributes = z.infer<
  typeof NexusOperationCancelRequestCompletedEventAttributes
>;
