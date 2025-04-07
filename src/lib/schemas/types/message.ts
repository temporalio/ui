import { z } from 'zod';

/**
 * (-- api-linter: core::0146::any=disabled
 *      aip.dev/not-precedent: We want runtime extensibility for the body field --)
 */
export const Message = z
  .object({
    /**An ID for this specific message.*/
    id: z.string().describe('An ID for this specific message.').optional(),
    /**
     * Identifies the specific instance of a protocol to which this message
     *  belongs.
     */
    protocolInstanceId: z
      .string()
      .describe(
        'Identifies the specific instance of a protocol to which this message\n belongs.',
      )
      .optional(),
    eventId: z.string().optional(),
    commandIndex: z.string().optional(),
    /**
     * The opaque data carried by this message. The protocol type can be
     *  extracted from the package name of the message carried inside the Any.
     */
    body: z
      .any()
      .describe(
        'The opaque data carried by this message. The protocol type can be\n extracted from the package name of the message carried inside the Any.',
      )
      .optional(),
  })
  .describe(
    '(-- api-linter: core::0146::any=disabled\n     aip.dev/not-precedent: We want runtime extensibility for the body field --)',
  );
export type Message = z.infer<typeof Message>;
