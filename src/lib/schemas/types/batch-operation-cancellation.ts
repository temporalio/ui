import { z } from 'zod';

/**
 * BatchOperationCancellation sends cancel requests to batch workflows.
 *  Keep the parameter in sync with temporal.api.workflowservice.v1.RequestCancelWorkflowExecutionRequest.
 *  Ignore first_execution_run_id because this is used for single workflow operation.
 */
export const BatchOperationCancellation = z
  .object({
    /**The identity of the worker/client*/
    identity: z
      .string()
      .describe('The identity of the worker/client')
      .optional(),
  })
  .describe(
    'BatchOperationCancellation sends cancel requests to batch workflows.\n Keep the parameter in sync with temporal.api.workflowservice.v1.RequestCancelWorkflowExecutionRequest.\n Ignore first_execution_run_id because this is used for single workflow operation.',
  );
export type BatchOperationCancellation = z.infer<
  typeof BatchOperationCancellation
>;
