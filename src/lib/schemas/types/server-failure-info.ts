import { z } from 'zod';

export const ServerFailureInfo = z.object({
  nonRetryable: z.boolean().optional(),
});
export type ServerFailureInfo = z.infer<typeof ServerFailureInfo>;
