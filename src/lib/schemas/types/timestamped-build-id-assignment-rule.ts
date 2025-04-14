import { z } from 'zod';

export const TimestampedBuildIdAssignmentRule = z.object({
  rule: z.any().optional(),
  createTime: z.string().datetime({ offset: true }).optional(),
});
export type TimestampedBuildIdAssignmentRule = z.infer<
  typeof TimestampedBuildIdAssignmentRule
>;
