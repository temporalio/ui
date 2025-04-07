import { z } from 'zod';

export const NexusOperationCancelRequestFailedEventAttributes = z.object({
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
  /**Failure details. A NexusOperationFailureInfo wrapping a CanceledFailureInfo.*/
  failure: z
    .any()
    .describe(
      'Failure details. A NexusOperationFailureInfo wrapping a CanceledFailureInfo.',
    )
    .optional(),
});
export type NexusOperationCancelRequestFailedEventAttributes = z.infer<
  typeof NexusOperationCancelRequestFailedEventAttributes
>;
