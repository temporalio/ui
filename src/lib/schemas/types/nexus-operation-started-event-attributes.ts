import { z } from 'zod';

/**
 * Event marking an asynchronous operation was started by the responding Nexus handler.
 *  If the operation completes synchronously, this event is not generated.
 *  In rare situations, such as request timeouts, the service may fail to record the actual start time and will fabricate
 *  this event upon receiving the operation completion via callback.
 */
export const NexusOperationStartedEventAttributes = z
  .object({
    /**The ID of the `NEXUS_OPERATION_SCHEDULED` event this task corresponds to.*/
    scheduledEventId: z
      .string()
      .describe(
        'The ID of the `NEXUS_OPERATION_SCHEDULED` event this task corresponds to.',
      )
      .optional(),
    /**
     * The operation ID returned by the Nexus handler in the response to the StartOperation request.
     *  This ID is used when canceling the operation.
     *
     *  Deprecated: Renamed to operation_token.
     */
    operationId: z
      .string()
      .describe(
        'The operation ID returned by the Nexus handler in the response to the StartOperation request.\n This ID is used when canceling the operation.\n\n Deprecated: Renamed to operation_token.',
      )
      .optional(),
    /**The request ID allocated at schedule time.*/
    requestId: z
      .string()
      .describe('The request ID allocated at schedule time.')
      .optional(),
    /**
     * The operation token returned by the Nexus handler in the response to the StartOperation request.
     *  This token is used when canceling the operation.
     */
    operationToken: z
      .string()
      .describe(
        'The operation token returned by the Nexus handler in the response to the StartOperation request.\n This token is used when canceling the operation.',
      )
      .optional(),
  })
  .describe(
    'Event marking an asynchronous operation was started by the responding Nexus handler.\n If the operation completes synchronously, this event is not generated.\n In rare situations, such as request timeouts, the service may fail to record the actual start time and will fabricate\n this event upon receiving the operation completion via callback.',
  );
export type NexusOperationStartedEventAttributes = z.infer<
  typeof NexusOperationStartedEventAttributes
>;
