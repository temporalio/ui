import { z } from 'zod';

export const TaskIdBlock = z.object({
  startId: z.string().optional(),
  endId: z.string().optional(),
});
export type TaskIdBlock = z.infer<typeof TaskIdBlock>;
