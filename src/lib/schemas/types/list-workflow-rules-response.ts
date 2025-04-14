import { z } from 'zod';

export const ListWorkflowRulesResponse = z.object({
  rules: z.array(z.any()).optional(),
  nextPageToken: z.string().optional(),
});
export type ListWorkflowRulesResponse = z.infer<
  typeof ListWorkflowRulesResponse
>;
