import { z } from 'zod';

/**
 * Holds information about ongoing transition of a workflow execution from one worker
 *  deployment version to another.
 *  Experimental. Might change in the future.
 */
export const DeploymentVersionTransition = z
  .object({
    /**
     * Required. The target Version of the transition. May be `__unversioned__` which means a
     *  so-far-versioned workflow is transitioning to unversioned workers.
     */
    version: z
      .string()
      .describe(
        'Required. The target Version of the transition. May be `__unversioned__` which means a\n so-far-versioned workflow is transitioning to unversioned workers.',
      )
      .optional(),
  })
  .describe(
    'Holds information about ongoing transition of a workflow execution from one worker\n deployment version to another.\n Experimental. Might change in the future.',
  );
export type DeploymentVersionTransition = z.infer<
  typeof DeploymentVersionTransition
>;
