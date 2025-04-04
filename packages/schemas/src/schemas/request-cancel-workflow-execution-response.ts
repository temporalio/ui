import { z } from 'zod';

export const RequestCancelWorkflowExecutionResponse = z.object({});
export type RequestCancelWorkflowExecutionResponse = z.infer<
  typeof RequestCancelWorkflowExecutionResponse
>;
