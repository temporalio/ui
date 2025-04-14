import { z } from 'zod';

/**[cleanup-wv-pre-release] Pre-release deployment APIs, clean up later*/
export const ListDeploymentsResponse = z
  .object({
    nextPageToken: z.string().optional(),
    deployments: z.array(z.any()).optional(),
  })
  .describe(
    '[cleanup-wv-pre-release] Pre-release deployment APIs, clean up later',
  );
export type ListDeploymentsResponse = z.infer<typeof ListDeploymentsResponse>;
