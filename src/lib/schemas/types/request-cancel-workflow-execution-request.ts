import { z } from 'zod';

export const RequestCancelWorkflowExecutionRequest = z.object({
  namespace: z.string().optional(),
  workflowExecution: z.any().optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
  /**Used to de-dupe cancellation requests*/
  requestId: z
    .string()
    .describe('Used to de-dupe cancellation requests')
    .optional(),
  /**
   * If set, this call will error if the most recent (if no run id is set on
   *  `workflow_execution`), or specified (if it is) workflow execution is not part of the same
   *  execution chain as this id.
   */
  firstExecutionRunId: z
    .string()
    .describe(
      'If set, this call will error if the most recent (if no run id is set on\n `workflow_execution`), or specified (if it is) workflow execution is not part of the same\n execution chain as this id.',
    )
    .optional(),
  /**Reason for requesting the cancellation*/
  reason: z
    .string()
    .describe('Reason for requesting the cancellation')
    .optional(),
  /**Links to be associated with the WorkflowExecutionCanceled event.*/
  links: z
    .array(z.any())
    .describe(
      'Links to be associated with the WorkflowExecutionCanceled event.',
    )
    .optional(),
});
export type RequestCancelWorkflowExecutionRequest = z.infer<
  typeof RequestCancelWorkflowExecutionRequest
>;
