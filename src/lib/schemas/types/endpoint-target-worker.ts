import { z } from 'zod';

/**Target a worker polling on a Nexus task queue in a specific namespace.*/
export const EndpointTarget_Worker = z
  .object({
    /**Namespace to route requests to.*/
    namespace: z
      .string()
      .describe('Namespace to route requests to.')
      .optional(),
    /**Nexus task queue to route requests to.*/
    taskQueue: z
      .string()
      .describe('Nexus task queue to route requests to.')
      .optional(),
  })
  .describe(
    'Target a worker polling on a Nexus task queue in a specific namespace.',
  );
export type EndpointTarget_Worker = z.infer<typeof EndpointTarget_Worker>;
