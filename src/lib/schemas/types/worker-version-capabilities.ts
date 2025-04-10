import { z } from 'zod';

/**
 * Identifies the version that a worker is compatible with when polling or identifying itself,
 *  and whether or not this worker is opting into the build-id based versioning feature. This is
 *  used by matching to determine which workers ought to receive what tasks.
 *  Deprecated. Use WorkerDeploymentOptions instead.
 */
export const WorkerVersionCapabilities = z
  .object({
    /**An opaque whole-worker identifier*/
    buildId: z
      .string()
      .describe('An opaque whole-worker identifier')
      .optional(),
    /**
     * If set, the worker is opting in to worker versioning, and wishes to only receive appropriate
     *  tasks.
     */
    useVersioning: z
      .boolean()
      .describe(
        'If set, the worker is opting in to worker versioning, and wishes to only receive appropriate\n tasks.',
      )
      .optional(),
    /**Must be sent if user has set a deployment series name (versioning-3).*/
    deploymentSeriesName: z
      .string()
      .describe(
        'Must be sent if user has set a deployment series name (versioning-3).',
      )
      .optional(),
  })
  .describe(
    'Identifies the version that a worker is compatible with when polling or identifying itself,\n and whether or not this worker is opting into the build-id based versioning feature. This is\n used by matching to determine which workers ought to receive what tasks.\n Deprecated. Use WorkerDeploymentOptions instead.',
  );
export type WorkerVersionCapabilities = z.infer<
  typeof WorkerVersionCapabilities
>;
