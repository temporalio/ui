import { z } from 'zod';

export const UpdateWorkerDeploymentVersionMetadataResponse = z.object({
  /**Full metadata after performing the update.*/
  metadata: z
    .any()
    .describe('Full metadata after performing the update.')
    .optional(),
});
export type UpdateWorkerDeploymentVersionMetadataResponse = z.infer<
  typeof UpdateWorkerDeploymentVersionMetadataResponse
>;
