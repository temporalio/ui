import { z } from 'zod';

export const TriggerWorkflowRuleResponse = z.object({
  /**True is the rule was applied, based on the rule conditions (predicate/visibility_query).*/
  applied: z
    .boolean()
    .describe(
      'True is the rule was applied, based on the rule conditions (predicate/visibility_query).',
    )
    .optional(),
});
export type TriggerWorkflowRuleResponse = z.infer<
  typeof TriggerWorkflowRuleResponse
>;
