import { z } from 'zod';

export const Link_WorkflowEvent = z.object({
  namespace: z.string().optional(),
  workflowId: z.string().optional(),
  runId: z.string().optional(),
  eventRef: z.any().optional(),
});
export type Link_WorkflowEvent = z.infer<typeof Link_WorkflowEvent>;
