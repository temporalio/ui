import { z } from 'zod';

/**
 * Target an external server by URL.
 *  At a later point, this will support providing credentials, in the meantime, an http.RoundTripper can be injected
 *  into the server to modify the request.
 */
export const EndpointTarget_External = z
  .object({
    /**URL to call.*/
    url: z.string().describe('URL to call.').optional(),
  })
  .describe(
    'Target an external server by URL.\n At a later point, this will support providing credentials, in the meantime, an http.RoundTripper can be injected\n into the server to modify the request.',
  );
export type EndpointTarget_External = z.infer<typeof EndpointTarget_External>;
