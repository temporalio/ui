import { z } from 'zod';

export const ResetWorkflowFailureInfo = z.object({
  lastHeartbeatDetails: z.any().optional(),
});
export type ResetWorkflowFailureInfo = z.infer<typeof ResetWorkflowFailureInfo>;
