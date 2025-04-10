import { z } from 'zod';

export const WorkflowTaskScheduledEventAttributes = z.object({
  /**The task queue this workflow task was enqueued in, which could be a normal or sticky queue*/
  taskQueue: z
    .any()
    .describe(
      'The task queue this workflow task was enqueued in, which could be a normal or sticky queue',
    )
    .optional(),
  /**
   * How long the worker has to process this task once receiving it before it times out
   *
   *  (-- api-linter: core::0140::prepositions=disabled
   *      aip.dev/not-precedent: "to" is used to indicate interval. --)
   */
  startToCloseTimeout: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'How long the worker has to process this task once receiving it before it times out\n\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: "to" is used to indicate interval. --)',
    )
    .optional(),
  /**Starting at 1, how many attempts there have been to complete this task*/
  attempt: z
    .number()
    .int()
    .describe(
      'Starting at 1, how many attempts there have been to complete this task',
    )
    .optional(),
});
export type WorkflowTaskScheduledEventAttributes = z.infer<
  typeof WorkflowTaskScheduledEventAttributes
>;
