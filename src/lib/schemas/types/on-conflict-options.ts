import { z } from 'zod';

/**
 * When StartWorkflowExecution uses the conflict policy WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING and
 *  there is already an existing running workflow, OnConflictOptions defines actions to be taken on
 *  the existing running workflow. In this case, it will create a WorkflowExecutionOptionsUpdatedEvent
 *  history event in the running workflow with the changes requested in this object.
 */
export const OnConflictOptions = z
  .object({
    /**Attaches the request ID to the running workflow.*/
    attachRequestId: z
      .boolean()
      .describe('Attaches the request ID to the running workflow.')
      .optional(),
    /**Attaches the completion callbacks to the running workflow.*/
    attachCompletionCallbacks: z
      .boolean()
      .describe('Attaches the completion callbacks to the running workflow.')
      .optional(),
    /**Attaches the links to the WorkflowExecutionOptionsUpdatedEvent history event.*/
    attachLinks: z
      .boolean()
      .describe(
        'Attaches the links to the WorkflowExecutionOptionsUpdatedEvent history event.',
      )
      .optional(),
  })
  .describe(
    'When StartWorkflowExecution uses the conflict policy WORKFLOW_ID_CONFLICT_POLICY_USE_EXISTING and\n there is already an existing running workflow, OnConflictOptions defines actions to be taken on\n the existing running workflow. In this case, it will create a WorkflowExecutionOptionsUpdatedEvent\n history event in the running workflow with the changes requested in this object.',
  );
export type OnConflictOptions = z.infer<typeof OnConflictOptions>;
