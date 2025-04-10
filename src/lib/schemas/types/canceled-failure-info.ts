import { z } from 'zod';

export const CanceledFailureInfo = z.object({ details: z.any().optional() });
export type CanceledFailureInfo = z.infer<typeof CanceledFailureInfo>;
