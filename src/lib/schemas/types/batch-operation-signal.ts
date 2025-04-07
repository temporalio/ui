import { z } from 'zod';

/**
 * BatchOperationSignal sends signals to batch workflows.
 *  Keep the parameter in sync with temporal.api.workflowservice.v1.SignalWorkflowExecutionRequest.
 */
export const BatchOperationSignal = z
  .object({
    /**The workflow author-defined name of the signal to send to the workflow*/
    signal: z
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
    /**The identity of the worker/client*/
    identity: z
      .string()
      .describe('The identity of the worker/client')
      .optional(),
  })
  .describe(
    'BatchOperationSignal sends signals to batch workflows.\n Keep the parameter in sync with temporal.api.workflowservice.v1.SignalWorkflowExecutionRequest.',
  );
export type BatchOperationSignal = z.infer<typeof BatchOperationSignal>;
