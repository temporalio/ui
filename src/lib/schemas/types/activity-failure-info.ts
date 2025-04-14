import { z } from 'zod';

export const ActivityFailureInfo = z.object({
  scheduledEventId: z.string().optional(),
  startedEventId: z.string().optional(),
  identity: z.string().optional(),
  activityType: z.any().optional(),
  activityId: z.string().optional(),
  retryState: z
    .enum([
      'RETRY_STATE_UNSPECIFIED',
      'RETRY_STATE_IN_PROGRESS',
      'RETRY_STATE_NON_RETRYABLE_FAILURE',
      'RETRY_STATE_TIMEOUT',
      'RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED',
      'RETRY_STATE_RETRY_POLICY_NOT_SET',
      'RETRY_STATE_INTERNAL_SERVER_ERROR',
      'RETRY_STATE_CANCEL_REQUESTED',
    ])
    .optional(),
});
export type ActivityFailureInfo = z.infer<typeof ActivityFailureInfo>;
