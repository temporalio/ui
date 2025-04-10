import { z } from 'zod';

export const WorkflowExecutionUpdateRejectedEventAttributes = z.object({
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
  rejectedRequestMessageId: z
    .string()
    .describe(
      'The message ID of the original request message that initiated this\n update. Needed so that the worker can recreate and deliver that same\n message as part of replay.',
    )
    .optional(),
  /**The event ID used to sequence the original request message.*/
  rejectedRequestSequencingEventId: z
    .string()
    .describe('The event ID used to sequence the original request message.')
    .optional(),
  /**
   * The message payload of the original request message that initiated this
   *  update.
   */
  rejectedRequest: z
    .any()
    .describe(
      'The message payload of the original request message that initiated this\n update.',
    )
    .optional(),
  /**The cause of rejection.*/
  failure: z.any().describe('The cause of rejection.').optional(),
});
export type WorkflowExecutionUpdateRejectedEventAttributes = z.infer<
  typeof WorkflowExecutionUpdateRejectedEventAttributes
>;
