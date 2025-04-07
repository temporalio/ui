import { z } from 'zod';

export const History = z.object({ events: z.array(z.any()).optional() });
export type History = z.infer<typeof History>;
