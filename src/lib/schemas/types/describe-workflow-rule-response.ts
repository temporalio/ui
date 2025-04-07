import { z } from 'zod';

export const DescribeWorkflowRuleResponse = z.object({
  /**The rule that was read.*/
  rule: z.any().describe('The rule that was read.').optional(),
});
export type DescribeWorkflowRuleResponse = z.infer<
  typeof DescribeWorkflowRuleResponse
>;
