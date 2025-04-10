import { z } from 'zod';

export const ListWorkflowExecutionsResponse = z.object({
  executions: z.array(z.any()).optional(),
  nextPageToken: z.string().optional(),
});
export type ListWorkflowExecutionsResponse = z.infer<
  typeof ListWorkflowExecutionsResponse
>;
