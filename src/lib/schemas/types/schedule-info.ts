import { z } from 'zod';

export const ScheduleInfo = z.object({
  /**Number of actions taken so far.*/
  actionCount: z
    .string()
    .describe('Number of actions taken so far.')
    .optional(),
  /**Number of times a scheduled action was skipped due to missing the catchup window.*/
  missedCatchupWindow: z
    .string()
    .describe(
      'Number of times a scheduled action was skipped due to missing the catchup window.',
    )
    .optional(),
  /**Number of skipped actions due to overlap.*/
  overlapSkipped: z
    .string()
    .describe('Number of skipped actions due to overlap.')
    .optional(),
  /**Number of dropped actions due to buffer limit.*/
  bufferDropped: z
    .string()
    .describe('Number of dropped actions due to buffer limit.')
    .optional(),
  /**
   * Number of actions in the buffer. The buffer holds the actions that cannot
   *  be immediately triggered (due to the overlap policy). These actions can be a result of
   *  the normal schedule or a backfill.
   */
  bufferSize: z
    .string()
    .describe(
      'Number of actions in the buffer. The buffer holds the actions that cannot\n be immediately triggered (due to the overlap policy). These actions can be a result of\n the normal schedule or a backfill.',
    )
    .optional(),
  /**
   * Currently-running workflows started by this schedule. (There might be
   *  more than one if the overlap policy allows overlaps.)
   *  Note that the run_ids in here are the original execution run ids as
   *  started by the schedule. If the workflows retried, did continue-as-new,
   *  or were reset, they might still be running but with a different run_id.
   */
  runningWorkflows: z
    .array(z.any())
    .describe(
      'Currently-running workflows started by this schedule. (There might be\n more than one if the overlap policy allows overlaps.)\n Note that the run_ids in here are the original execution run ids as\n started by the schedule. If the workflows retried, did continue-as-new,\n or were reset, they might still be running but with a different run_id.',
    )
    .optional(),
  /**Most recent ten actual action times (including manual triggers).*/
  recentActions: z
    .array(z.any())
    .describe(
      'Most recent ten actual action times (including manual triggers).',
    )
    .optional(),
  /**Next ten scheduled action times.*/
  futureActionTimes: z
    .array(z.string().datetime({ offset: true }))
    .describe('Next ten scheduled action times.')
    .optional(),
  /**Timestamps of schedule creation and last update.*/
  createTime: z
    .string()
    .datetime({ offset: true })
    .describe('Timestamps of schedule creation and last update.')
    .optional(),
  updateTime: z.string().datetime({ offset: true }).optional(),
  invalidScheduleError: z.string().optional(),
});
export type ScheduleInfo = z.infer<typeof ScheduleInfo>;
