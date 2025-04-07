import { z } from 'zod';

export const ScheduleState = z.object({
  /**
   * Informative human-readable message with contextual notes, e.g. the reason
   *  a schedule is paused. The system may overwrite this message on certain
   *  conditions, e.g. when pause-on-failure happens.
   */
  notes: z
    .string()
    .describe(
      'Informative human-readable message with contextual notes, e.g. the reason\n a schedule is paused. The system may overwrite this message on certain\n conditions, e.g. when pause-on-failure happens.',
    )
    .optional(),
  /**If true, do not take any actions based on the schedule spec.*/
  paused: z
    .boolean()
    .describe('If true, do not take any actions based on the schedule spec.')
    .optional(),
  /**
   * If limited_actions is true, decrement remaining_actions after each
   *  action, and do not take any more scheduled actions if remaining_actions
   *  is zero. Actions may still be taken by explicit request (i.e. trigger
   *  immediately or backfill). Skipped actions (due to overlap policy) do not
   *  count against remaining actions.
   *  If a schedule has no more remaining actions, then the schedule will be
   *  subject to automatic deletion (after several days).
   */
  limitedActions: z
    .boolean()
    .describe(
      'If limited_actions is true, decrement remaining_actions after each\n action, and do not take any more scheduled actions if remaining_actions\n is zero. Actions may still be taken by explicit request (i.e. trigger\n immediately or backfill). Skipped actions (due to overlap policy) do not\n count against remaining actions.\n If a schedule has no more remaining actions, then the schedule will be\n subject to automatic deletion (after several days).',
    )
    .optional(),
  remainingActions: z.string().optional(),
});
export type ScheduleState = z.infer<typeof ScheduleState>;
