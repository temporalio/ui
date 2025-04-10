import { z } from 'zod';

/**Nexus operation timed out.*/
export const NexusOperationTimedOutEventAttributes = z
  .object({
    /**The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.*/
    scheduledEventId: z
      .string()
      .describe(
        'The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.',
      )
      .optional(),
    /**Failure details. A NexusOperationFailureInfo wrapping a CanceledFailureInfo.*/
    failure: z
      .any()
      .describe(
        'Failure details. A NexusOperationFailureInfo wrapping a CanceledFailureInfo.',
      )
      .optional(),
    /**The request ID allocated at schedule time.*/
    requestId: z
      .string()
      .describe('The request ID allocated at schedule time.')
      .optional(),
  })
  .describe('Nexus operation timed out.');
export type NexusOperationTimedOutEventAttributes = z.infer<
  typeof NexusOperationTimedOutEventAttributes
>;
