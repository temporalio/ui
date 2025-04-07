import { z } from 'zod';

export const RespondActivityTaskFailedResponse = z.object({
  /**
   * Server validation failures could include
   *  last_heartbeat_details payload is too large, request failure is too large
   */
  failures: z
    .array(z.any())
    .describe(
      'Server validation failures could include\n last_heartbeat_details payload is too large, request failure is too large',
    )
    .optional(),
});
export type RespondActivityTaskFailedResponse = z.infer<
  typeof RespondActivityTaskFailedResponse
>;
