import { z } from 'zod';

export const TimerCanceledEventAttributes = z.object({
  /**Will match the `timer_id` from `TIMER_STARTED` event for this timer*/
  timerId: z
    .string()
    .describe(
      'Will match the `timer_id` from `TIMER_STARTED` event for this timer',
    )
    .optional(),
  /**The id of the `TIMER_STARTED` event itself*/
  startedEventId: z
    .string()
    .describe('The id of the `TIMER_STARTED` event itself')
    .optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
  /**The id of the worker who requested this cancel*/
  identity: z
    .string()
    .describe('The id of the worker who requested this cancel')
    .optional(),
});
export type TimerCanceledEventAttributes = z.infer<
  typeof TimerCanceledEventAttributes
>;
