import { z } from 'zod';

export const TimerFiredEventAttributes = z.object({
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
});
export type TimerFiredEventAttributes = z.infer<
  typeof TimerFiredEventAttributes
>;
