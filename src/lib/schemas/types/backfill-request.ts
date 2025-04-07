import { z } from 'zod';

export const BackfillRequest = z.object({
  /**
   * Time range to evaluate schedule in. Currently, this time range is
   *  exclusive on start_time and inclusive on end_time. (This is admittedly
   *  counterintuitive and it may change in the future, so to be safe, use a
   *  start time strictly before a scheduled time.) Also note that an action
   *  nominally scheduled in the interval but with jitter that pushes it after
   *  end_time will not be included.
   */
  startTime: z
    .string()
    .datetime({ offset: true })
    .describe(
      'Time range to evaluate schedule in. Currently, this time range is\n exclusive on start_time and inclusive on end_time. (This is admittedly\n counterintuitive and it may change in the future, so to be safe, use a\n start time strictly before a scheduled time.) Also note that an action\n nominally scheduled in the interval but with jitter that pushes it after\n end_time will not be included.',
    )
    .optional(),
  endTime: z.string().datetime({ offset: true }).optional(),
  /**If set, override overlap policy for this request.*/
  overlapPolicy: z
    .enum([
      'SCHEDULE_OVERLAP_POLICY_UNSPECIFIED',
      'SCHEDULE_OVERLAP_POLICY_SKIP',
      'SCHEDULE_OVERLAP_POLICY_BUFFER_ONE',
      'SCHEDULE_OVERLAP_POLICY_BUFFER_ALL',
      'SCHEDULE_OVERLAP_POLICY_CANCEL_OTHER',
      'SCHEDULE_OVERLAP_POLICY_TERMINATE_OTHER',
      'SCHEDULE_OVERLAP_POLICY_ALLOW_ALL',
    ])
    .describe('If set, override overlap policy for this request.')
    .optional(),
});
export type BackfillRequest = z.infer<typeof BackfillRequest>;
