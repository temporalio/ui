import { z } from 'zod';

/**Nexus operation failed.*/
export const NexusOperationFailedEventAttributes = z
  .object({
    /**The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.*/
    scheduledEventId: z
      .string()
      .describe(
        'The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.',
      )
      .optional(),
    /**Failure details. A NexusOperationFailureInfo wrapping an ApplicationFailureInfo.*/
    failure: z
      .any()
      .describe(
        'Failure details. A NexusOperationFailureInfo wrapping an ApplicationFailureInfo.',
      )
      .optional(),
    /**The request ID allocated at schedule time.*/
    requestId: z
      .string()
      .describe('The request ID allocated at schedule time.')
      .optional(),
  })
  .describe('Nexus operation failed.');
export type NexusOperationFailedEventAttributes = z.infer<
  typeof NexusOperationFailedEventAttributes
>;
