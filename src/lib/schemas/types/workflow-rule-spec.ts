import { z } from 'zod';

export const WorkflowRuleSpec = z.object({
  /**
   * The id of the new workflow rule. Must be unique within the namespace.
   *  Can be set by the user, and can have business meaning.
   */
  id: z
    .string()
    .describe(
      'The id of the new workflow rule. Must be unique within the namespace.\n Can be set by the user, and can have business meaning.',
    )
    .optional(),
  activityStart: z.any().optional(),
  /**
   * Restricted Visibility query.
   *  This query is used to filter workflows in this namespace to which this rule should apply.
   *  It is applied to any running workflow each time a triggering event occurs, before the trigger predicate is evaluated.
   *  The following workflow attributes are supported:
   *  - WorkflowType
   *  - WorkflowId
   *  - StartTime
   *  - ExecutionStatus
   */
  visibilityQuery: z
    .string()
    .describe(
      'Restricted Visibility query.\n This query is used to filter workflows in this namespace to which this rule should apply.\n It is applied to any running workflow each time a triggering event occurs, before the trigger predicate is evaluated.\n The following workflow attributes are supported:\n - WorkflowType\n - WorkflowId\n - StartTime\n - ExecutionStatus',
    )
    .optional(),
  /**WorkflowRuleAction to be taken when the rule is triggered and predicate is matched.*/
  actions: z
    .array(z.any())
    .describe(
      'WorkflowRuleAction to be taken when the rule is triggered and predicate is matched.',
    )
    .optional(),
  /**
   * Expiration time of the rule. After this time, the rule will be deleted.
   *  Can be empty if the rule should never expire.
   */
  expirationTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Expiration time of the rule. After this time, the rule will be deleted.\n Can be empty if the rule should never expire.',
    )
    .optional(),
});
export type WorkflowRuleSpec = z.infer<typeof WorkflowRuleSpec>;
