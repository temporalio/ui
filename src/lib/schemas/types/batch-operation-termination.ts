import { z } from 'zod';

/**
 * BatchOperationTermination sends terminate requests to batch workflows.
 *  Keep the parameter in sync with temporal.api.workflowservice.v1.TerminateWorkflowExecutionRequest.
 *  Ignore first_execution_run_id because this is used for single workflow operation.
 */
export const BatchOperationTermination = z
  .object({
    /**Serialized value(s) to provide to the termination event*/
    details: z
      .any()
      .describe('Serialized value(s) to provide to the termination event')
      .optional(),
    /**The identity of the worker/client*/
    identity: z
      .string()
      .describe('The identity of the worker/client')
      .optional(),
  })
  .describe(
    'BatchOperationTermination sends terminate requests to batch workflows.\n Keep the parameter in sync with temporal.api.workflowservice.v1.TerminateWorkflowExecutionRequest.\n Ignore first_execution_run_id because this is used for single workflow operation.',
  );
export type BatchOperationTermination = z.infer<
  typeof BatchOperationTermination
>;
