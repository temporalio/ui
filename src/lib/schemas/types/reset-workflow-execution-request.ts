import { z } from 'zod';

export const ResetWorkflowExecutionRequest = z.object({
  namespace: z.string().optional(),
  /**
   * The workflow to reset. If this contains a run ID then the workflow will be reset back to the
   *  provided event ID in that run. Otherwise it will be reset to the provided event ID in the
   *  current run. In all cases the current run will be terminated and a new run started.
   */
  workflowExecution: z
    .any()
    .describe(
      'The workflow to reset. If this contains a run ID then the workflow will be reset back to the\n provided event ID in that run. Otherwise it will be reset to the provided event ID in the\n current run. In all cases the current run will be terminated and a new run started.',
    )
    .optional(),
  reason: z.string().optional(),
  /**
   * The id of a `WORKFLOW_TASK_COMPLETED`,`WORKFLOW_TASK_TIMED_OUT`, `WORKFLOW_TASK_FAILED`, or
   *  `WORKFLOW_TASK_STARTED` event to reset to.
   */
  workflowTaskFinishEventId: z
    .string()
    .describe(
      'The id of a `WORKFLOW_TASK_COMPLETED`,`WORKFLOW_TASK_TIMED_OUT`, `WORKFLOW_TASK_FAILED`, or\n `WORKFLOW_TASK_STARTED` event to reset to.',
    )
    .optional(),
  /**Used to de-dupe reset requests*/
  requestId: z.string().describe('Used to de-dupe reset requests').optional(),
  /**
   * Event types to be reapplied (deprecated)
   *  Default: RESET_REAPPLY_TYPE_SIGNAL
   */
  resetReapplyType: z
    .enum([
      'RESET_REAPPLY_TYPE_UNSPECIFIED',
      'RESET_REAPPLY_TYPE_SIGNAL',
      'RESET_REAPPLY_TYPE_NONE',
      'RESET_REAPPLY_TYPE_ALL_ELIGIBLE',
    ])
    .describe(
      'Event types to be reapplied (deprecated)\n Default: RESET_REAPPLY_TYPE_SIGNAL',
    )
    .optional(),
  /**Event types not to be reapplied*/
  resetReapplyExcludeTypes: z
    .array(
      z.enum([
        'RESET_REAPPLY_EXCLUDE_TYPE_UNSPECIFIED',
        'RESET_REAPPLY_EXCLUDE_TYPE_SIGNAL',
        'RESET_REAPPLY_EXCLUDE_TYPE_UPDATE',
        'RESET_REAPPLY_EXCLUDE_TYPE_NEXUS',
        'RESET_REAPPLY_EXCLUDE_TYPE_CANCEL_REQUEST',
      ]),
    )
    .describe('Event types not to be reapplied')
    .optional(),
});
export type ResetWorkflowExecutionRequest = z.infer<
  typeof ResetWorkflowExecutionRequest
>;
