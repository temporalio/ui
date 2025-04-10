import { z } from 'zod';

export const SignalWorkflowExecutionRequest = z.object({
  namespace: z.string().optional(),
  workflowExecution: z.any().optional(),
  /**The workflow author-defined name of the signal to send to the workflow*/
  signalName: z
    .string()
    .describe(
      'The workflow author-defined name of the signal to send to the workflow',
    )
    .optional(),
  /**Serialized value(s) to provide with the signal*/
  input: z
    .any()
    .describe('Serialized value(s) to provide with the signal')
    .optional(),
  /**The identity of the worker/client*/
  identity: z.string().describe('The identity of the worker/client').optional(),
  /**Used to de-dupe sent signals*/
  requestId: z.string().describe('Used to de-dupe sent signals').optional(),
  /**Deprecated*/
  control: z.string().describe('Deprecated').optional(),
  /**
   * Headers that are passed with the signal to the processing workflow.
   *  These can include things like auth or tracing tokens.
   */
  header: z
    .any()
    .describe(
      'Headers that are passed with the signal to the processing workflow.\n These can include things like auth or tracing tokens.',
    )
    .optional(),
  /**Links to be associated with the WorkflowExecutionSignaled event.*/
  links: z
    .array(z.any())
    .describe(
      'Links to be associated with the WorkflowExecutionSignaled event.',
    )
    .optional(),
});
export type SignalWorkflowExecutionRequest = z.infer<
  typeof SignalWorkflowExecutionRequest
>;
