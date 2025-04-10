import { z } from 'zod';

export const ResetWorkflowExecutionResponse = z.object({
  runId: z.string().optional(),
});
export type ResetWorkflowExecutionResponse = z.infer<
  typeof ResetWorkflowExecutionResponse
>;
