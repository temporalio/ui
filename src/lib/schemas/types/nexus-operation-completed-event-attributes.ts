import { z } from 'zod';

/**Nexus operation completed successfully.*/
export const NexusOperationCompletedEventAttributes = z
  .object({
    /**The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.*/
    scheduledEventId: z
      .string()
      .describe(
        'The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.',
      )
      .optional(),
    /**
     * Serialized result of the Nexus operation. The response of the Nexus handler.
     *  Delivered either via a completion callback or as a response to a synchronous operation.
     */
    result: z
      .any()
      .describe(
        'Serialized result of the Nexus operation. The response of the Nexus handler.\n Delivered either via a completion callback or as a response to a synchronous operation.',
      )
      .optional(),
    /**The request ID allocated at schedule time.*/
    requestId: z
      .string()
      .describe('The request ID allocated at schedule time.')
      .optional(),
  })
  .describe('Nexus operation completed successfully.');
export type NexusOperationCompletedEventAttributes = z.infer<
  typeof NexusOperationCompletedEventAttributes
>;
