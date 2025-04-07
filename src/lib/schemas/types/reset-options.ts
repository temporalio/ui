import { z } from 'zod';

/**
 * Describes where and how to reset a workflow, used for batch reset currently
 *  and may be used for single-workflow reset later.
 */
export const ResetOptions = z
  .object({
    /**
     * The id of a specific `WORKFLOW_TASK_COMPLETED`,`WORKFLOW_TASK_TIMED_OUT`, `WORKFLOW_TASK_FAILED`, or
     *  `WORKFLOW_TASK_STARTED` event to reset to.
     *  Note that this option doesn't make sense when used as part of a batch request.
     */
    workflowTaskId: z
      .string()
      .describe(
        "The id of a specific `WORKFLOW_TASK_COMPLETED`,`WORKFLOW_TASK_TIMED_OUT`, `WORKFLOW_TASK_FAILED`, or\n `WORKFLOW_TASK_STARTED` event to reset to.\n Note that this option doesn't make sense when used as part of a batch request.",
      )
      .optional(),
    /**
     * Resets to the first workflow task processed by this build id.
     *  If the workflow was not processed by the build id, or the workflow task can't be
     *  determined, no reset will be performed.
     *  Note that by default, this reset is allowed to be to a prior run in a chain of
     *  continue-as-new.
     */
    buildId: z
      .string()
      .describe(
        "Resets to the first workflow task processed by this build id.\n If the workflow was not processed by the build id, or the workflow task can't be\n determined, no reset will be performed.\n Note that by default, this reset is allowed to be to a prior run in a chain of\n continue-as-new.",
      )
      .optional(),
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
    /**
     * If true, limit the reset to only within the current run. (Applies to build_id targets and
     *  possibly others in the future.)
     */
    currentRunOnly: z
      .boolean()
      .describe(
        'If true, limit the reset to only within the current run. (Applies to build_id targets and\n possibly others in the future.)',
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
  })
  .describe(
    'Describes where and how to reset a workflow, used for batch reset currently\n and may be used for single-workflow reset later.',
  );
export type ResetOptions = z.infer<typeof ResetOptions>;
