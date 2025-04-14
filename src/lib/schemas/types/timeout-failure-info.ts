import { z } from 'zod';

export const TimeoutFailureInfo = z.object({
  timeoutType: z
    .enum([
      'TIMEOUT_TYPE_UNSPECIFIED',
      'TIMEOUT_TYPE_START_TO_CLOSE',
      'TIMEOUT_TYPE_SCHEDULE_TO_START',
      'TIMEOUT_TYPE_SCHEDULE_TO_CLOSE',
      'TIMEOUT_TYPE_HEARTBEAT',
    ])
    .optional(),
  lastHeartbeatDetails: z.any().optional(),
});
export type TimeoutFailureInfo = z.infer<typeof TimeoutFailureInfo>;
