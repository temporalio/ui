import { z } from 'zod';

export const ExecuteMultiOperationResponse_Response = z.object({
  startWorkflow: z.any().optional(),
  updateWorkflow: z.any().optional(),
});
export type ExecuteMultiOperationResponse_Response = z.infer<
  typeof ExecuteMultiOperationResponse_Response
>;
