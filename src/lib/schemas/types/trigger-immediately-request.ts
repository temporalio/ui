import { z } from 'zod';

export const TriggerImmediatelyRequest = z.object({
  /**If set, override overlap policy for this one request.*/
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
    .describe('If set, override overlap policy for this one request.')
    .optional(),
});
export type TriggerImmediatelyRequest = z.infer<
  typeof TriggerImmediatelyRequest
>;
