import { z } from 'zod';

export const BadBinaryInfo = z.object({
  reason: z.string().optional(),
  operator: z.string().optional(),
  createTime: z.string().datetime({ offset: true }).optional(),
});
export type BadBinaryInfo = z.infer<typeof BadBinaryInfo>;
