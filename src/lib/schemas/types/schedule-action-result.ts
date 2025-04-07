import { z } from 'zod';

export const ScheduleActionResult = z.object({
  /**Time that the action was taken (according to the schedule, including jitter).*/
  scheduleTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Time that the action was taken (according to the schedule, including jitter).',
    )
    .optional(),
  /**Time that the action was taken (real time).*/
  actualTime: z
    .string()
    .datetime({ offset: true })
    .describe('Time that the action was taken (real time).')
    .optional(),
  /**If action was start_workflow:*/
  startWorkflowResult: z
    .any()
    .describe('If action was start_workflow:')
    .optional(),
  /**
   * If the action was start_workflow, this field will reflect an
   *  eventually-consistent view of the started workflow's status.
   */
  startWorkflowStatus: z
    .enum([
      'WORKFLOW_EXECUTION_STATUS_UNSPECIFIED',
      'WORKFLOW_EXECUTION_STATUS_RUNNING',
      'WORKFLOW_EXECUTION_STATUS_COMPLETED',
      'WORKFLOW_EXECUTION_STATUS_FAILED',
      'WORKFLOW_EXECUTION_STATUS_CANCELED',
      'WORKFLOW_EXECUTION_STATUS_TERMINATED',
      'WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW',
      'WORKFLOW_EXECUTION_STATUS_TIMED_OUT',
    ])
    .describe(
      "If the action was start_workflow, this field will reflect an\n eventually-consistent view of the started workflow's status.",
    )
    .optional(),
});
export type ScheduleActionResult = z.infer<typeof ScheduleActionResult>;
