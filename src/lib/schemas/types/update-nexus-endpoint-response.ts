import { z } from 'zod';

export const UpdateNexusEndpointResponse = z.object({
  /**Data post acceptance. Can be used to issue additional updates to this record.*/
  endpoint: z
    .any()
    .describe(
      'Data post acceptance. Can be used to issue additional updates to this record.',
    )
    .optional(),
});
export type UpdateNexusEndpointResponse = z.infer<
  typeof UpdateNexusEndpointResponse
>;
