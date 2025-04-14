import { z } from 'zod';

export const ActivityTaskCompletedEventAttributes = z.object({
  /**Serialized results of the activity. IE: The return value of the activity function*/
  result: z
    .any()
    .describe(
      'Serialized results of the activity. IE: The return value of the activity function',
    )
    .optional(),
  /**The id of the `ACTIVITY_TASK_SCHEDULED` event this completion corresponds to*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_SCHEDULED` event this completion corresponds to',
    )
    .optional(),
  /**The id of the `ACTIVITY_TASK_STARTED` event this completion corresponds to*/
  startedEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_STARTED` event this completion corresponds to',
    )
    .optional(),
  /**id of the worker that completed this task*/
  identity: z
    .string()
    .describe('id of the worker that completed this task')
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
export type ActivityTaskCompletedEventAttributes = z.infer<
  typeof ActivityTaskCompletedEventAttributes
>;
