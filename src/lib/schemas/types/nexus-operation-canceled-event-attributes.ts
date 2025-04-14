import { z } from 'zod';

/**Nexus operation completed as canceled. May or may not have been due to a cancellation request by the workflow.*/
export const NexusOperationCanceledEventAttributes = z
  .object({
    /**The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.*/
    scheduledEventId: z
      .string()
      .describe(
        'The ID of the `NEXUS_OPERATION_SCHEDULED` event. Uniquely identifies this operation.',
      )
      .optional(),
    /**Cancellation details.*/
    failure: z.any().describe('Cancellation details.').optional(),
    /**The request ID allocated at schedule time.*/
    requestId: z
      .string()
      .describe('The request ID allocated at schedule time.')
      .optional(),
  })
  .describe(
    'Nexus operation completed as canceled. May or may not have been due to a cancellation request by the workflow.',
  );
export type NexusOperationCanceledEventAttributes = z.infer<
  typeof NexusOperationCanceledEventAttributes
>;
