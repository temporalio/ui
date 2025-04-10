import { z } from 'zod';

/**
 * A Worker Deployment (Deployment, for short) represents all workers serving
 *  a shared set of Task Queues. Typically, a Deployment represents one service or
 *  application.
 *  A Deployment contains multiple Deployment Versions, each representing a different
 *  version of workers. (see documentation of WorkerDeploymentVersionInfo)
 *  Deployment records are created in Temporal server automatically when their
 *  first poller arrives to the server.
 *  Experimental. Worker Deployments are experimental and might significantly change in the future.
 */
export const WorkerDeploymentInfo = z
  .object({
    /**Identifies a Worker Deployment. Must be unique within the namespace.*/
    name: z
      .string()
      .describe(
        'Identifies a Worker Deployment. Must be unique within the namespace.',
      )
      .optional(),
    /**
     * Deployment Versions that are currently tracked in this Deployment. A DeploymentVersion will be
     *  cleaned up automatically if all the following conditions meet:
     *  - It does not receive new executions (is not current or ramping)
     *  - It has no active pollers (see WorkerDeploymentVersionInfo.pollers_status)
     *  - It is drained (see WorkerDeploymentVersionInfo.drainage_status)
     */
    versionSummaries: z
      .array(z.any())
      .describe(
        'Deployment Versions that are currently tracked in this Deployment. A DeploymentVersion will be\n cleaned up automatically if all the following conditions meet:\n - It does not receive new executions (is not current or ramping)\n - It has no active pollers (see WorkerDeploymentVersionInfo.pollers_status) \n - It is drained (see WorkerDeploymentVersionInfo.drainage_status)',
      )
      .optional(),
    createTime: z.string().datetime({ offset: true }).optional(),
    routingConfig: z.any().optional(),
    /**
     * Identity of the last client who modified the configuration of this Deployment. Set to the
     *  `identity` value sent by APIs such as `SetWorkerDeploymentCurrentVersion` and
     *  `SetWorkerDeploymentRampingVersion`.
     */
    lastModifierIdentity: z
      .string()
      .describe(
        'Identity of the last client who modified the configuration of this Deployment. Set to the\n `identity` value sent by APIs such as `SetWorkerDeploymentCurrentVersion` and\n `SetWorkerDeploymentRampingVersion`.',
      )
      .optional(),
  })
  .describe(
    'A Worker Deployment (Deployment, for short) represents all workers serving \n a shared set of Task Queues. Typically, a Deployment represents one service or \n application.\n A Deployment contains multiple Deployment Versions, each representing a different \n version of workers. (see documentation of WorkerDeploymentVersionInfo)\n Deployment records are created in Temporal server automatically when their\n first poller arrives to the server.\n Experimental. Worker Deployments are experimental and might significantly change in the future.',
  );
export type WorkerDeploymentInfo = z.infer<typeof WorkerDeploymentInfo>;
