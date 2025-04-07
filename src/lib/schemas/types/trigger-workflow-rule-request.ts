import { z } from 'zod';

export const TriggerWorkflowRuleRequest = z.object({
  namespace: z.string().optional(),
  /**Execution info of the workflow which scheduled this activity*/
  execution: z
    .any()
    .describe('Execution info of the workflow which scheduled this activity')
    .optional(),
  id: z.string().optional(),
  /**Note: Rule ID and expiration date are not used in the trigger request.*/
  spec: z
    .any()
    .describe(
      'Note: Rule ID and expiration date are not used in the trigger request.',
    )
    .optional(),
});
export type TriggerWorkflowRuleRequest = z.infer<
  typeof TriggerWorkflowRuleRequest
>;
