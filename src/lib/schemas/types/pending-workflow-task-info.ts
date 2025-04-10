import { z } from 'zod';

export const PendingWorkflowTaskInfo = z.object({
  state: z
    .enum([
      'PENDING_WORKFLOW_TASK_STATE_UNSPECIFIED',
      'PENDING_WORKFLOW_TASK_STATE_SCHEDULED',
      'PENDING_WORKFLOW_TASK_STATE_STARTED',
    ])
    .optional(),
  scheduledTime: z.string().datetime({ offset: true }).optional(),
  /**
   * original_scheduled_time is the scheduled time of the first workflow task during workflow task heartbeat.
   *  Heartbeat workflow task is done by RespondWorkflowTaskComplete with ForceCreateNewWorkflowTask == true and no command
   *  In this case, OriginalScheduledTime won't change. Then when current time - original_scheduled_time exceeds
   *  some threshold, the workflow task will be forced timeout.
   */
  originalScheduledTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      "original_scheduled_time is the scheduled time of the first workflow task during workflow task heartbeat.\n Heartbeat workflow task is done by RespondWorkflowTaskComplete with ForceCreateNewWorkflowTask == true and no command\n In this case, OriginalScheduledTime won't change. Then when current time - original_scheduled_time exceeds\n some threshold, the workflow task will be forced timeout.",
    )
    .optional(),
  startedTime: z.string().datetime({ offset: true }).optional(),
  attempt: z.number().int().optional(),
});
export type PendingWorkflowTaskInfo = z.infer<typeof PendingWorkflowTaskInfo>;
