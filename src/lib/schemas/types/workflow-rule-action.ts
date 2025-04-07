import { z } from 'zod';

export const WorkflowRuleAction = z.object({
  activityPause: z.any().optional(),
});
export type WorkflowRuleAction = z.infer<typeof WorkflowRuleAction>;
