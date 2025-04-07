import { z } from 'zod';

export const ApplicationFailureInfo = z.object({
  type: z.string().optional(),
  nonRetryable: z.boolean().optional(),
  details: z.any().optional(),
  /**
   * next_retry_delay can be used by the client to override the activity
   *  retry interval calculated by the retry policy. Retry attempts will
   *  still be subject to the maximum retries limit and total time limit
   *  defined by the policy.
   */
  nextRetryDelay: z
    .string()
    .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
    .describe(
      'next_retry_delay can be used by the client to override the activity\n retry interval calculated by the retry policy. Retry attempts will\n still be subject to the maximum retries limit and total time limit\n defined by the policy.',
    )
    .optional(),
});
export type ApplicationFailureInfo = z.infer<typeof ApplicationFailureInfo>;
