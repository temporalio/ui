import { z } from 'zod';

/**Reachability of tasks for a worker by build id, in one or more task queues.*/
export const BuildIdReachability = z
  .object({
    /**A build id or empty if unversioned.*/
    buildId: z
      .string()
      .describe('A build id or empty if unversioned.')
      .optional(),
    /**Reachability per task queue.*/
    taskQueueReachability: z
      .array(z.any())
      .describe('Reachability per task queue.')
      .optional(),
  })
  .describe(
    'Reachability of tasks for a worker by build id, in one or more task queues.',
  );
export type BuildIdReachability = z.infer<typeof BuildIdReachability>;
