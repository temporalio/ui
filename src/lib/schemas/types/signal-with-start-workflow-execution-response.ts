import { z } from 'zod';

export const SignalWithStartWorkflowExecutionResponse = z.object({
  /**The run id of the workflow that was started - or just signaled, if it was already running.*/
  runId: z
    .string()
    .describe(
      'The run id of the workflow that was started - or just signaled, if it was already running.',
    )
    .optional(),
  /**If true, a new workflow was started.*/
  started: z
    .boolean()
    .describe('If true, a new workflow was started.')
    .optional(),
});
export type SignalWithStartWorkflowExecutionResponse = z.infer<
  typeof SignalWithStartWorkflowExecutionResponse
>;
