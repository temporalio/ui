import { z } from 'zod';

export const DescribeScheduleResponse = z.object({
  /**
   * The complete current schedule details. This may not match the schedule as
   *  created because:
   *  - some types of schedule specs may get compiled into others (e.g.
   *    CronString into StructuredCalendarSpec)
   *  - some unspecified fields may be replaced by defaults
   *  - some fields in the state are modified automatically
   *  - the schedule may have been modified by UpdateSchedule or PatchSchedule
   */
  schedule: z
    .any()
    .describe(
      'The complete current schedule details. This may not match the schedule as\n created because:\n - some types of schedule specs may get compiled into others (e.g.\n   CronString into StructuredCalendarSpec)\n - some unspecified fields may be replaced by defaults\n - some fields in the state are modified automatically\n - the schedule may have been modified by UpdateSchedule or PatchSchedule',
    )
    .optional(),
  /**Extra schedule state info.*/
  info: z.any().describe('Extra schedule state info.').optional(),
  /**The memo and search attributes that the schedule was created with.*/
  memo: z
    .any()
    .describe(
      'The memo and search attributes that the schedule was created with.',
    )
    .optional(),
  searchAttributes: z.any().optional(),
  /**
   * This value can be passed back to UpdateSchedule to ensure that the
   *  schedule was not modified between a Describe and an Update, which could
   *  lead to lost updates and other confusion.
   */
  conflictToken: z
    .string()
    .describe(
      'This value can be passed back to UpdateSchedule to ensure that the\n schedule was not modified between a Describe and an Update, which could\n lead to lost updates and other confusion.',
    )
    .optional(),
});
export type DescribeScheduleResponse = z.infer<typeof DescribeScheduleResponse>;
