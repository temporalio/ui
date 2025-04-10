import { z } from 'zod';

export const WorkflowTaskTimedOutEventAttributes = z.object({
  /**The id of the `WORKFLOW_TASK_SCHEDULED` event this task corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `WORKFLOW_TASK_SCHEDULED` event this task corresponds to',
    )
    .optional(),
  /**The id of the `WORKFLOW_TASK_STARTED` event this task corresponds to*/
  startedEventId: z
    .string()
    .describe(
      'The id of the `WORKFLOW_TASK_STARTED` event this task corresponds to',
    )
    .optional(),
  timeoutType: z
    .enum([
      'TIMEOUT_TYPE_UNSPECIFIED',
      'TIMEOUT_TYPE_START_TO_CLOSE',
      'TIMEOUT_TYPE_SCHEDULE_TO_START',
      'TIMEOUT_TYPE_SCHEDULE_TO_CLOSE',
      'TIMEOUT_TYPE_HEARTBEAT',
    ])
    .optional(),
});
export type WorkflowTaskTimedOutEventAttributes = z.infer<
  typeof WorkflowTaskTimedOutEventAttributes
>;
