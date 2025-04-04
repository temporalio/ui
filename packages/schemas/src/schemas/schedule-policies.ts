import { z } from 'zod';

export const SchedulePolicies = z.object({
  /**
   * Policy for overlaps.
   *  Note that this can be changed after a schedule has taken some actions,
   *  and some changes might produce unintuitive results. In general, the later
   *  policy overrides the earlier policy.
   */
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
    .describe(
      'Policy for overlaps.\n Note that this can be changed after a schedule has taken some actions,\n and some changes might produce unintuitive results. In general, the later\n policy overrides the earlier policy.',
    )
    .optional(),
  /**
   * Policy for catchups:
   *  If the Temporal server misses an action due to one or more components
   *  being down, and comes back up, the action will be run if the scheduled
   *  time is within this window from the current time.
   *  This value defaults to one year, and can't be less than 10 seconds.
   */
  catchupWindow: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      "Policy for catchups:\n If the Temporal server misses an action due to one or more components\n being down, and comes back up, the action will be run if the scheduled\n time is within this window from the current time.\n This value defaults to one year, and can't be less than 10 seconds.",
    )
    .optional(),
  /**
   * If true, and a workflow run fails or times out, turn on "paused".
   *  This applies after retry policies: the full chain of retries must fail to
   *  trigger a pause here.
   */
  pauseOnFailure: z
    .boolean()
    .describe(
      'If true, and a workflow run fails or times out, turn on "paused".\n This applies after retry policies: the full chain of retries must fail to\n trigger a pause here.',
    )
    .optional(),
  /**
   * If true, and the action would start a workflow, a timestamp will not be
   *  appended to the scheduled workflow id.
   */
  keepOriginalWorkflowId: z
    .boolean()
    .describe(
      'If true, and the action would start a workflow, a timestamp will not be\n appended to the scheduled workflow id.',
    )
    .optional(),
});
export type SchedulePolicies = z.infer<typeof SchedulePolicies>;
