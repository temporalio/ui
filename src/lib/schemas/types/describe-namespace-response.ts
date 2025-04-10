import { z } from 'zod';

export const DescribeNamespaceResponse = z.object({
  namespaceInfo: z.any().optional(),
  config: z.any().optional(),
  replicationConfig: z.any().optional(),
  failoverVersion: z.string().optional(),
  isGlobalNamespace: z.boolean().optional(),
  /**
   * Contains the historical state of failover_versions for the cluster, truncated to contain only the last N
   *  states to ensure that the list does not grow unbounded.
   */
  failoverHistory: z
    .array(z.any())
    .describe(
      'Contains the historical state of failover_versions for the cluster, truncated to contain only the last N\n states to ensure that the list does not grow unbounded.',
    )
    .optional(),
});
export type DescribeNamespaceResponse = z.infer<
  typeof DescribeNamespaceResponse
>;
