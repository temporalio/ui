import { z } from 'zod';

export const TimestampedCompatibleBuildIdRedirectRule = z.object({
  rule: z.any().optional(),
  createTime: z.string().datetime({ offset: true }).optional(),
});
export type TimestampedCompatibleBuildIdRedirectRule = z.infer<
  typeof TimestampedCompatibleBuildIdRedirectRule
>;
