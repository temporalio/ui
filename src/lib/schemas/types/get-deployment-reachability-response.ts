import { z } from 'zod';

/**[cleanup-wv-pre-release] Pre-release deployment APIs, clean up later*/
export const GetDeploymentReachabilityResponse = z
  .object({
    deploymentInfo: z.any().optional(),
    reachability: z
      .enum([
        'DEPLOYMENT_REACHABILITY_UNSPECIFIED',
        'DEPLOYMENT_REACHABILITY_REACHABLE',
        'DEPLOYMENT_REACHABILITY_CLOSED_WORKFLOWS_ONLY',
        'DEPLOYMENT_REACHABILITY_UNREACHABLE',
      ])
      .optional(),
    /**
     * Reachability level might come from server cache. This timestamp specifies when the value
     *  was actually calculated.
     */
    lastUpdateTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'Reachability level might come from server cache. This timestamp specifies when the value\n was actually calculated.',
      )
      .optional(),
  })
  .describe(
    '[cleanup-wv-pre-release] Pre-release deployment APIs, clean up later',
  );
export type GetDeploymentReachabilityResponse = z.infer<
  typeof GetDeploymentReachabilityResponse
>;
