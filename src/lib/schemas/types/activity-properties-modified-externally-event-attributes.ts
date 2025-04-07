import { z } from 'zod';

export const ActivityPropertiesModifiedExternallyEventAttributes = z.object({
  /**The id of the `ACTIVITY_TASK_SCHEDULED` event this modification corresponds to.*/
  scheduledEventId: z
    .string()
    .describe(
      'The id of the `ACTIVITY_TASK_SCHEDULED` event this modification corresponds to.',
    )
    .optional(),
  /**
   * If set, update the retry policy of the activity, replacing it with the specified one.
   *  The number of attempts at the activity is preserved.
   */
  newRetryPolicy: z
    .any()
    .describe(
      'If set, update the retry policy of the activity, replacing it with the specified one.\n The number of attempts at the activity is preserved.',
    )
    .optional(),
});
export type ActivityPropertiesModifiedExternallyEventAttributes = z.infer<
  typeof ActivityPropertiesModifiedExternallyEventAttributes
>;
