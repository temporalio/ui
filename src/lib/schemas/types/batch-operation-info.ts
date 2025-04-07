import { z } from 'zod';

export const BatchOperationInfo = z.object({
  /**Batch job ID*/
  jobId: z.string().describe('Batch job ID').optional(),
  /**Batch operation state*/
  state: z
    .enum([
      'BATCH_OPERATION_STATE_UNSPECIFIED',
      'BATCH_OPERATION_STATE_RUNNING',
      'BATCH_OPERATION_STATE_COMPLETED',
      'BATCH_OPERATION_STATE_FAILED',
    ])
    .describe('Batch operation state')
    .optional(),
  /**Batch operation start time*/
  startTime: z
    .string()
    .datetime({ offset: true })
    .describe('Batch operation start time')
    .optional(),
  /**Batch operation close time*/
  closeTime: z
    .string()
    .datetime({ offset: true })
    .describe('Batch operation close time')
    .optional(),
});
export type BatchOperationInfo = z.infer<typeof BatchOperationInfo>;
