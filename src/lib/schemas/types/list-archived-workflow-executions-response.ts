import { z } from 'zod';

export const ListArchivedWorkflowExecutionsResponse = z.object({
  executions: z.array(z.any()).optional(),
  nextPageToken: z.string().optional(),
});
export type ListArchivedWorkflowExecutionsResponse = z.infer<
  typeof ListArchivedWorkflowExecutionsResponse
>;
