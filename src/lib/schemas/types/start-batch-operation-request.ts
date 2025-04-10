import { z } from 'zod';

export const StartBatchOperationRequest = z.object({
  /**Namespace that contains the batch operation*/
  namespace: z
    .string()
    .describe('Namespace that contains the batch operation')
    .optional(),
  /**
   * Visibility query defines the the group of workflow to apply the batch operation
   *  This field and `executions` are mutually exclusive
   */
  visibilityQuery: z
    .string()
    .describe(
      'Visibility query defines the the group of workflow to apply the batch operation\n This field and `executions` are mutually exclusive',
    )
    .optional(),
  /**Job ID defines the unique ID for the batch job*/
  jobId: z
    .string()
    .describe('Job ID defines the unique ID for the batch job')
    .optional(),
  /**Reason to perform the batch operation*/
  reason: z
    .string()
    .describe('Reason to perform the batch operation')
    .optional(),
  /**
   * Executions to apply the batch operation
   *  This field and `visibility_query` are mutually exclusive
   */
  executions: z
    .array(z.any())
    .describe(
      'Executions to apply the batch operation\n This field and `visibility_query` are mutually exclusive',
    )
    .optional(),
  /**
   * Limit for the number of operations processed per second within this batch.
   *  Its purpose is to reduce the stress on the system caused by batch operations, which helps to prevent system
   *  overload and minimize potential delays in executing ongoing tasks for user workers.
   *  Note that when no explicit limit is provided, the server will operate according to its limit defined by the
   *  dynamic configuration key `worker.batcherRPS`. This also applies if the value in this field exceeds the
   *  server's configured limit.
   */
  maxOperationsPerSecond: z
    .number()
    .describe(
      "Limit for the number of operations processed per second within this batch.\n Its purpose is to reduce the stress on the system caused by batch operations, which helps to prevent system\n overload and minimize potential delays in executing ongoing tasks for user workers.\n Note that when no explicit limit is provided, the server will operate according to its limit defined by the\n dynamic configuration key `worker.batcherRPS`. This also applies if the value in this field exceeds the\n server's configured limit.",
    )
    .optional(),
  terminationOperation: z.any().optional(),
  signalOperation: z.any().optional(),
  cancellationOperation: z.any().optional(),
  deletionOperation: z.any().optional(),
  resetOperation: z.any().optional(),
  updateWorkflowOptionsOperation: z.any().optional(),
  unpauseActivitiesOperation: z.any().optional(),
});
export type StartBatchOperationRequest = z.infer<
  typeof StartBatchOperationRequest
>;
