import { z } from 'zod';

export const StopBatchOperationRequest = z.object({
  /**Namespace that contains the batch operation*/
  namespace: z
    .string()
    .describe('Namespace that contains the batch operation')
    .optional(),
  /**Batch job id*/
  jobId: z.string().describe('Batch job id').optional(),
  /**Reason to stop a batch operation*/
  reason: z.string().describe('Reason to stop a batch operation').optional(),
  /**Identity of the operator*/
  identity: z.string().describe('Identity of the operator').optional(),
});
export type StopBatchOperationRequest = z.infer<
  typeof StopBatchOperationRequest
>;
