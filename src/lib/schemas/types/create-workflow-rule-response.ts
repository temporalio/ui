import { z } from 'zod';

export const CreateWorkflowRuleResponse = z.object({
  /**Created rule.*/
  rule: z.any().describe('Created rule.').optional(),
  /**Batch Job ID if force-scan flag was provided. Otherwise empty.*/
  jobId: z
    .string()
    .describe('Batch Job ID if force-scan flag was provided. Otherwise empty.')
    .optional(),
});
export type CreateWorkflowRuleResponse = z.infer<
  typeof CreateWorkflowRuleResponse
>;
