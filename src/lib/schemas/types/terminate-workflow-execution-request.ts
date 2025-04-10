import { z } from 'zod';

export const TerminateWorkflowExecutionRequest = z.object({
  namespace: z.string().optional(),
  workflowExecution: z.any().optional(),
  reason: z.string().optional(),
  /**Serialized additional information to attach to the termination event*/
  details: z
    .any()
    .describe(
      'Serialized additional information to attach to the termination event',
    )
    .optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
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
  /**Links to be associated with the WorkflowExecutionTerminated event.*/
  links: z
    .array(z.any())
    .describe(
      'Links to be associated with the WorkflowExecutionTerminated event.',
    )
    .optional(),
});
export type TerminateWorkflowExecutionRequest = z.infer<
  typeof TerminateWorkflowExecutionRequest
>;
