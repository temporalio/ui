import { z } from 'zod';

export const TimerStartedEventAttributes = z.object({
  /**The worker/user assigned id for this timer*/
  timerId: z
    .string()
    .describe('The worker/user assigned id for this timer')
    .optional(),
  /**
   * How long until this timer fires
   *
   *  (-- api-linter: core::0140::prepositions=disabled
   *      aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  startToFireTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'How long until this timer fires\n\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: "to" is used to indicate interval. --)',
    )
    .optional(),
  /**The `WORKFLOW_TASK_COMPLETED` event which this command was reported with*/
  workflowTaskCompletedEventId: z
    .string()
    .describe(
      'The `WORKFLOW_TASK_COMPLETED` event which this command was reported with',
    )
    .optional(),
});
export type TimerStartedEventAttributes = z.infer<
  typeof TimerStartedEventAttributes
>;
