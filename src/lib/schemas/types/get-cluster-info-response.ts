import { z } from 'zod';

/**GetClusterInfoResponse contains information about Temporal cluster.*/
export const GetClusterInfoResponse = z
  .object({
    /**
     * Key is client name i.e "temporal-go", "temporal-java", or "temporal-cli".
     *  Value is ranges of supported versions of this client i.e ">1.1.1 <=1.4.0 || ^5.0.0".
     */
    supportedClients: z
      .record(z.string())
      .describe(
        'Key is client name i.e "temporal-go", "temporal-java", or "temporal-cli".\n Value is ranges of supported versions of this client i.e ">1.1.1 <=1.4.0 || ^5.0.0".',
      )
      .optional(),
    serverVersion: z.string().optional(),
    clusterId: z.string().optional(),
    versionInfo: z.any().optional(),
    clusterName: z.string().optional(),
    historyShardCount: z.number().int().optional(),
    persistenceStore: z.string().optional(),
    visibilityStore: z.string().optional(),
  })
  .describe(
    'GetClusterInfoResponse contains information about Temporal cluster.',
  );
export type GetClusterInfoResponse = z.infer<typeof GetClusterInfoResponse>;
