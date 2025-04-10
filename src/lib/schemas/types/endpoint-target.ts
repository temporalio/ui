import { z } from 'zod';

/**Target to route requests to.*/
export const EndpointTarget = z
  .object({ worker: z.any().optional(), external: z.any().optional() })
  .describe('Target to route requests to.');
export type EndpointTarget = z.infer<typeof EndpointTarget>;
