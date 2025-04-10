import { z } from 'zod';

export const ScheduleAction = z.object({
  /**
   * All fields of NewWorkflowExecutionInfo are valid except for:
   *  - workflow_id_reuse_policy
   *  - cron_schedule
   *  The workflow id of the started workflow may not match this exactly,
   *  it may have a timestamp appended for uniqueness.
   */
  startWorkflow: z
    .any()
    .describe(
      'All fields of NewWorkflowExecutionInfo are valid except for:\n - workflow_id_reuse_policy\n - cron_schedule\n The workflow id of the started workflow may not match this exactly,\n it may have a timestamp appended for uniqueness.',
    )
    .optional(),
});
export type ScheduleAction = z.infer<typeof ScheduleAction>;
