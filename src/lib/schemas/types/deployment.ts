import { z } from 'zod';

/**
 * `Deployment` identifies a deployment of Temporal workers. The combination of deployment series
 *  name + build ID serves as the identifier. User can use `WorkerDeploymentOptions` in their worker
 *  programs to specify these values.
 *  Deprecated.
 */
export const Deployment = z
  .object({
    /**
     * Different versions of the same worker service/application are related together by having a
     *  shared series name.
     *  Out of all deployments of a series, one can be designated as the current deployment, which
     *  receives new workflow executions and new tasks of workflows with
     *  `VERSIONING_BEHAVIOR_AUTO_UPGRADE` versioning behavior.
     */
    seriesName: z
      .string()
      .describe(
        'Different versions of the same worker service/application are related together by having a\n shared series name.\n Out of all deployments of a series, one can be designated as the current deployment, which\n receives new workflow executions and new tasks of workflows with\n `VERSIONING_BEHAVIOR_AUTO_UPGRADE` versioning behavior.',
      )
      .optional(),
    /**
     * Build ID changes with each version of the worker when the worker program code and/or config
     *  changes.
     */
    buildId: z
      .string()
      .describe(
        'Build ID changes with each version of the worker when the worker program code and/or config\n changes.',
      )
      .optional(),
  })
  .describe(
    '`Deployment` identifies a deployment of Temporal workers. The combination of deployment series\n name + build ID serves as the identifier. User can use `WorkerDeploymentOptions` in their worker\n programs to specify these values.\n Deprecated.',
  );
export type Deployment = z.infer<typeof Deployment>;
