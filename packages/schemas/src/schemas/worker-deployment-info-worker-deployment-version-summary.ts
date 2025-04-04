import { z } from 'zod';

export const WorkerDeploymentInfo_WorkerDeploymentVersionSummary = z.object({
  /**The fully-qualified string representation of the version, in the form "<deployment_name>.<build_id>".*/
  version: z
    .string()
    .describe(
      'The fully-qualified string representation of the version, in the form "<deployment_name>.<build_id>".',
    )
    .optional(),
  createTime: z.string().datetime({ offset: true }).optional(),
  drainageStatus: z
    .enum([
      'VERSION_DRAINAGE_STATUS_UNSPECIFIED',
      'VERSION_DRAINAGE_STATUS_DRAINING',
      'VERSION_DRAINAGE_STATUS_DRAINED',
    ])
    .optional(),
});
export type WorkerDeploymentInfo_WorkerDeploymentVersionSummary = z.infer<
  typeof WorkerDeploymentInfo_WorkerDeploymentVersionSummary
>;
