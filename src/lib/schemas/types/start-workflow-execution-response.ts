import { z } from 'zod';

export const StartWorkflowExecutionResponse = z.object({
  /**The run id of the workflow that was started - or used (via WorkflowIdConflictPolicy USE_EXISTING).*/
  runId: z
    .string()
    .describe(
      'The run id of the workflow that was started - or used (via WorkflowIdConflictPolicy USE_EXISTING).',
    )
    .optional(),
  /**If true, a new workflow was started.*/
  started: z
    .boolean()
    .describe('If true, a new workflow was started.')
    .optional(),
  /**
   * When `request_eager_execution` is set on the `StartWorkflowExecutionRequest`, the server - if supported - will
   *  return the first workflow task to be eagerly executed.
   *  The caller is expected to have a worker available to process the task.
   */
  eagerWorkflowTask: z
    .any()
    .describe(
      'When `request_eager_execution` is set on the `StartWorkflowExecutionRequest`, the server - if supported - will\n return the first workflow task to be eagerly executed.\n The caller is expected to have a worker available to process the task.',
    )
    .optional(),
});
export type StartWorkflowExecutionResponse = z.infer<
  typeof StartWorkflowExecutionResponse
>;
