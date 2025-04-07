import { z } from 'zod';

export const WorkflowExecutionSignaledEventAttributes = z.object({
  /**The name/type of the signal to fire*/
  signalName: z
    .string()
    .describe('The name/type of the signal to fire')
    .optional(),
  /**Will be deserialized and provided as argument(s) to the signal handler*/
  input: z
    .any()
    .describe(
      'Will be deserialized and provided as argument(s) to the signal handler',
    )
    .optional(),
  /**id of the worker/client who sent this signal*/
  identity: z
    .string()
    .describe('id of the worker/client who sent this signal')
    .optional(),
  /**
   * Headers that were passed by the sender of the signal and copied by temporal
   *  server into the workflow task.
   */
  header: z
    .any()
    .describe(
      'Headers that were passed by the sender of the signal and copied by temporal \n server into the workflow task.',
    )
    .optional(),
  /**This field is deprecated and never respected. It should always be set to false.*/
  skipGenerateWorkflowTask: z
    .boolean()
    .describe(
      'This field is deprecated and never respected. It should always be set to false.',
    )
    .optional(),
  /**When signal origin is a workflow execution, this field is set.*/
  externalWorkflowExecution: z
    .any()
    .describe('When signal origin is a workflow execution, this field is set.')
    .optional(),
});
export type WorkflowExecutionSignaledEventAttributes = z.infer<
  typeof WorkflowExecutionSignaledEventAttributes
>;
