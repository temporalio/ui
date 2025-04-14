import { z } from 'zod';

export const SignalWorkflowExecutionResponse = z.object({});
export type SignalWorkflowExecutionResponse = z.infer<
  typeof SignalWorkflowExecutionResponse
>;
