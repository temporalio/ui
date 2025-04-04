import { z } from 'zod';

/**
 * Holds information about ongoing transition of a workflow execution from one deployment to another.
 *  Deprecated. Use DeploymentVersionTransition.
 */
export const DeploymentTransition = z
  .object({
    /**
     * The target deployment of the transition. Null means a so-far-versioned workflow is
     *  transitioning to unversioned workers.
     */
    deployment: z
      .any()
      .describe(
        'The target deployment of the transition. Null means a so-far-versioned workflow is\n transitioning to unversioned workers.',
      )
      .optional(),
  })
  .describe(
    'Holds information about ongoing transition of a workflow execution from one deployment to another.\n Deprecated. Use DeploymentVersionTransition.',
  );
export type DeploymentTransition = z.infer<typeof DeploymentTransition>;
