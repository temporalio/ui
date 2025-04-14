import { z } from 'zod';

export const CreateWorkflowRuleRequest = z.object({
  namespace: z.string().optional(),
  /**The rule specification .*/
  spec: z.any().describe('The rule specification .').optional(),
  /**
   * If true, the rule will be applied to the currently running workflows via batch job.
   *  If not set , the rule will only be applied when triggering condition is satisfied.
   *  visibility_query in the rule will be used to select the workflows to apply the rule to.
   */
  forceScan: z
    .boolean()
    .describe(
      'If true, the rule will be applied to the currently running workflows via batch job.\n If not set , the rule will only be applied when triggering condition is satisfied.\n visibility_query in the rule will be used to select the workflows to apply the rule to.',
    )
    .optional(),
  /**Used to de-dupe requests. Typically should be UUID.*/
  requestId: z
    .string()
    .describe('Used to de-dupe requests. Typically should be UUID.')
    .optional(),
});
export type CreateWorkflowRuleRequest = z.infer<
  typeof CreateWorkflowRuleRequest
>;
