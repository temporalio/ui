import { z } from 'zod';

export const GetNexusEndpointResponse = z.object({
  endpoint: z.any().optional(),
});
export type GetNexusEndpointResponse = z.infer<typeof GetNexusEndpointResponse>;
