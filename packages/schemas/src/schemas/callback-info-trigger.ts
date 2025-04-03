import { z } from 'zod';

export const CallbackInfo_Trigger = z.object({
  workflowClosed: z.any().optional(),
});
export type CallbackInfo_Trigger = z.infer<typeof CallbackInfo_Trigger>;
