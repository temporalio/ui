import { z } from 'zod';

export const CreateNexusEndpointRequest = z.object({
  /**Endpoint definition to create.*/
  spec: z.any().describe('Endpoint definition to create.').optional(),
});
export type CreateNexusEndpointRequest = z.infer<
  typeof CreateNexusEndpointRequest
>;
