import { z } from 'zod';

/**
 * Used as part of Deployment write APIs to update metadata attached to a deployment.
 *  Deprecated.
 */
export const UpdateDeploymentMetadata = z
  .object({
    upsertEntries: z.record(z.any()).optional(),
    /**List of keys to remove from the metadata.*/
    removeEntries: z
      .array(z.string())
      .describe('List of keys to remove from the metadata.')
      .optional(),
  })
  .describe(
    'Used as part of Deployment write APIs to update metadata attached to a deployment.\n Deprecated.',
  );
export type UpdateDeploymentMetadata = z.infer<typeof UpdateDeploymentMetadata>;
