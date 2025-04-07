import { z } from 'zod';

export const QueryWorkflowResponse = z.object({
  queryResult: z.any().optional(),
  queryRejected: z.any().optional(),
});
export type QueryWorkflowResponse = z.infer<typeof QueryWorkflowResponse>;
