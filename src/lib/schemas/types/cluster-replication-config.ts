import { z } from 'zod';

export const ClusterReplicationConfig = z.object({
  clusterName: z.string().optional(),
});
export type ClusterReplicationConfig = z.infer<typeof ClusterReplicationConfig>;
