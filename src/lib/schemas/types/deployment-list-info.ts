import { z } from 'zod';

/**
 * DeploymentListInfo is an abbreviated set of fields from DeploymentInfo that's returned in
 *  ListDeployments.
 *  Deprecated.
 */
export const DeploymentListInfo = z
  .object({
    deployment: z.any().optional(),
    createTime: z.string().datetime({ offset: true }).optional(),
    /**If this deployment is the current deployment of its deployment series.*/
    isCurrent: z
      .boolean()
      .describe(
        'If this deployment is the current deployment of its deployment series.',
      )
      .optional(),
  })
  .describe(
    "DeploymentListInfo is an abbreviated set of fields from DeploymentInfo that's returned in\n ListDeployments.\n Deprecated.",
  );
export type DeploymentListInfo = z.infer<typeof DeploymentListInfo>;
