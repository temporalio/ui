import { z } from 'zod';

export const WorkflowExecutionUpdateAcceptedEventAttributes = z.object({
  /**The instance ID of the update protocol that generated this event.*/
  protocolInstanceId: z
    .string()
    .describe(
      'The instance ID of the update protocol that generated this event.',
    )
    .optional(),
  /**
   * The message ID of the original request message that initiated this
   *  update. Needed so that the worker can recreate and deliver that same
   *  message as part of replay.
   */
  acceptedRequestMessageId: z
    .string()
    .describe(
      'The message ID of the original request message that initiated this\n update. Needed so that the worker can recreate and deliver that same\n message as part of replay.',
    )
    .optional(),
  /**The event ID used to sequence the original request message.*/
  acceptedRequestSequencingEventId: z
    .string()
    .describe('The event ID used to sequence the original request message.')
    .optional(),
  /**
   * The message payload of the original request message that initiated this
   *  update.
   */
  acceptedRequest: z
    .any()
    .describe(
      'The message payload of the original request message that initiated this\n update.',
    )
    .optional(),
});
export type WorkflowExecutionUpdateAcceptedEventAttributes = z.infer<
  typeof WorkflowExecutionUpdateAcceptedEventAttributes
>;
