import { z } from 'zod';

/**
 * `DeploymentInfo` holds information about a deployment. Deployment information is tracked
 *  automatically by server as soon as the first poll from that deployment reaches the server. There
 *  can be multiple task queue workers in a single deployment which are listed in this message.
 *  Deprecated.
 */
export const DeploymentInfo = z
  .object({
    deployment: z.any().optional(),
    createTime: z.string().datetime({ offset: true }).optional(),
    taskQueueInfos: z.array(z.any()).optional(),
    /**
     * A user-defined set of key-values. Can be updated as part of write operations to the
     *  deployment, such as `SetCurrentDeployment`.
     */
    metadata: z
      .record(z.any())
      .describe(
        'A user-defined set of key-values. Can be updated as part of write operations to the\n deployment, such as `SetCurrentDeployment`.',
      )
      .optional(),
    /**If this deployment is the current deployment of its deployment series.*/
    isCurrent: z
      .boolean()
      .describe(
        'If this deployment is the current deployment of its deployment series.',
      )
      .optional(),
  })
  .describe(
    '`DeploymentInfo` holds information about a deployment. Deployment information is tracked\n automatically by server as soon as the first poll from that deployment reaches the server. There\n can be multiple task queue workers in a single deployment which are listed in this message.\n Deprecated.',
  );
export type DeploymentInfo = z.infer<typeof DeploymentInfo>;
