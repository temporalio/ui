import { z } from 'zod';

export const ListNexusEndpointsResponse = z.object({
  /**Token for getting the next page.*/
  nextPageToken: z
    .string()
    .describe('Token for getting the next page.')
    .optional(),
  endpoints: z.array(z.any()).optional(),
});
export type ListNexusEndpointsResponse = z.infer<
  typeof ListNexusEndpointsResponse
>;
