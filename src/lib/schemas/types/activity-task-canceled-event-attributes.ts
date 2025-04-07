import { z } from 'zod';

export const ActivityTaskCanceledEventAttributes = z.object({
  /**Additional information that the activity reported upon confirming cancellation*/
  details: z
    .any()
    .describe(
      'Additional information that the activity reported upon confirming cancellation',
    )
    .optional(),
  /**
   * id of the most recent `ACTIVITY_TASK_CANCEL_REQUESTED` event which refers to the same
   *  activity
   */
  latestCancelRequestedEventId: z
    .string()
    .describe(
      'id of the most recent `ACTIVITY_TASK_CANCEL_REQUESTED` event which refers to the same\n activity',
    )
    .optional(),
  /**The id of the `ACTIVITY_TASK_SCHEDULED` event this cancel confirmation corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_SCHEDULED` event this cancel confirmation corresponds to',
    )
    .optional(),
  /**The id of the `ACTIVITY_TASK_STARTED` event this cancel confirmation corresponds to*/
  startedEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_STARTED` event this cancel confirmation corresponds to',
    )
    .optional(),
  /**id of the worker who canceled this activity*/
  identity: z
    .string()
    .describe('id of the worker who canceled this activity')
    .optional(),
  /**
   * Version info of the worker who processed this workflow task.
   *  Deprecated. Use the info inside the corresponding ActivityTaskStartedEvent
   */
  workerVersion: z
    .any()
    .describe(
      'Version info of the worker who processed this workflow task.\n Deprecated. Use the info inside the corresponding ActivityTaskStartedEvent',
    )
    .optional(),
});
export type ActivityTaskCanceledEventAttributes = z.infer<
  typeof ActivityTaskCanceledEventAttributes
>;
