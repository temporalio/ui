import { z } from 'zod';

export const DescribeBatchOperationResponse = z.object({
  /**Batch operation type*/
  operationType: z
    .enum([
      'BATCH_OPERATION_TYPE_UNSPECIFIED',
      'BATCH_OPERATION_TYPE_TERMINATE',
      'BATCH_OPERATION_TYPE_CANCEL',
      'BATCH_OPERATION_TYPE_SIGNAL',
      'BATCH_OPERATION_TYPE_DELETE',
      'BATCH_OPERATION_TYPE_RESET',
      'BATCH_OPERATION_TYPE_UPDATE_EXECUTION_OPTIONS',
    ])
    .describe('Batch operation type')
    .optional(),
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
  /**Total operation count*/
  totalOperationCount: z.string().describe('Total operation count').optional(),
  /**Complete operation count*/
  completeOperationCount: z
    .string()
    .describe('Complete operation count')
    .optional(),
  /**Failure operation count*/
  failureOperationCount: z
    .string()
    .describe('Failure operation count')
    .optional(),
  /**Identity indicates the operator identity*/
  identity: z
    .string()
    .describe('Identity indicates the operator identity')
    .optional(),
  /**Reason indicates the reason to stop a operation*/
  reason: z
    .string()
    .describe('Reason indicates the reason to stop a operation')
    .optional(),
});
export type DescribeBatchOperationResponse = z.infer<
  typeof DescribeBatchOperationResponse
>;
