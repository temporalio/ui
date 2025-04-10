import { z } from 'zod';

export const SchedulePatch = z.object({
  /**If set, trigger one action immediately.*/
  triggerImmediately: z
    .any()
    .describe('If set, trigger one action immediately.')
    .optional(),
  /**
   * If set, runs though the specified time period(s) and takes actions as if that time
   *  passed by right now, all at once. The overlap policy can be overridden for the
   *  scope of the backfill.
   */
  backfillRequest: z
    .array(z.any())
    .describe(
      'If set, runs though the specified time period(s) and takes actions as if that time\n passed by right now, all at once. The overlap policy can be overridden for the\n scope of the backfill.',
    )
    .optional(),
  /**
   * If set, change the state to paused or unpaused (respectively) and set the
   *  notes field to the value of the string.
   */
  pause: z
    .string()
    .describe(
      'If set, change the state to paused or unpaused (respectively) and set the\n notes field to the value of the string.',
    )
    .optional(),
  unpause: z.string().optional(),
});
export type SchedulePatch = z.infer<typeof SchedulePatch>;
