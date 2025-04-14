import { z } from 'zod';

export const ExecuteMultiOperationResponse = z.object({
  responses: z.array(z.any()).optional(),
});
export type ExecuteMultiOperationResponse = z.infer<
  typeof ExecuteMultiOperationResponse
>;
