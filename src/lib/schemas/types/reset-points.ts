import { z } from 'zod';

export const ResetPoints = z.object({ points: z.array(z.any()).optional() });
export type ResetPoints = z.infer<typeof ResetPoints>;
