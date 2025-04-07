import { z } from 'zod';

/**Contains mutable fields for an Endpoint.*/
export const EndpointSpec = z
  .object({
    /**
     * Endpoint name, unique for this cluster. Must match `[a-zA-Z_][a-zA-Z0-9_]*`.
     *  Renaming an endpoint breaks all workflow callers that reference this endpoint, causing operations to fail.
     */
    name: z
      .string()
      .describe(
        'Endpoint name, unique for this cluster. Must match `[a-zA-Z_][a-zA-Z0-9_]*`.\n Renaming an endpoint breaks all workflow callers that reference this endpoint, causing operations to fail.',
      )
      .optional(),
    /**
     * Markdown description serialized as a single JSON string.
     *  If the Payload is encrypted, the UI and CLI may decrypt with the configured codec server endpoint.
     *  By default, the server enforces a limit of 20,000 bytes for this entire payload.
     */
    description: z
      .any()
      .describe(
        'Markdown description serialized as a single JSON string.\n If the Payload is encrypted, the UI and CLI may decrypt with the configured codec server endpoint.\n By default, the server enforces a limit of 20,000 bytes for this entire payload.',
      )
      .optional(),
    /**Target to route requests to.*/
    target: z.any().describe('Target to route requests to.').optional(),
  })
  .describe('Contains mutable fields for an Endpoint.');
export type EndpointSpec = z.infer<typeof EndpointSpec>;
