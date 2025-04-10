import { z } from 'zod';

/**Information a user can set, often for use by user interfaces.*/
export const UserMetadata = z
  .object({
    /**
     * Short-form text that provides a summary. This payload should be a "json/plain"-encoded payload
     *  that is a single JSON string for use in user interfaces. User interface formatting may not
     *  apply to this text when used in "title" situations. The payload data section is limited to 400
     *  bytes by default.
     */
    summary: z
      .any()
      .describe(
        'Short-form text that provides a summary. This payload should be a "json/plain"-encoded payload\n that is a single JSON string for use in user interfaces. User interface formatting may not\n apply to this text when used in "title" situations. The payload data section is limited to 400\n bytes by default.',
      )
      .optional(),
    /**
     * Long-form text that provides details. This payload should be a "json/plain"-encoded payload
     *  that is a single JSON string for use in user interfaces. User interface formatting may apply to
     *  this text in common use. The payload data section is limited to 20000 bytes by default.
     */
    details: z
      .any()
      .describe(
        'Long-form text that provides details. This payload should be a "json/plain"-encoded payload\n that is a single JSON string for use in user interfaces. User interface formatting may apply to\n this text in common use. The payload data section is limited to 20000 bytes by default.',
      )
      .optional(),
  })
  .describe('Information a user can set, often for use by user interfaces.');
export type UserMetadata = z.infer<typeof UserMetadata>;
