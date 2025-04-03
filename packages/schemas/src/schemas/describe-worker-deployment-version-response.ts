import { z } from 'zod';

export const DescribeWorkerDeploymentVersionResponse = z.object({
  workerDeploymentVersionInfo: z.any().optional(),
});
export type DescribeWorkerDeploymentVersionResponse = z.infer<
  typeof DescribeWorkerDeploymentVersionResponse
>;
