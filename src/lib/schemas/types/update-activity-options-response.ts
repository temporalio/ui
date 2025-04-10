import { z } from 'zod';

export const UpdateActivityOptionsResponse = z.object({
  /**Activity options after an update*/
  activityOptions: z
    .any()
    .describe('Activity options after an update')
    .optional(),
});
export type UpdateActivityOptionsResponse = z.infer<
  typeof UpdateActivityOptionsResponse
>;
