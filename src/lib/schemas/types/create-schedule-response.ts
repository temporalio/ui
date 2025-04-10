import { z } from 'zod';

export const CreateScheduleResponse = z.object({
  conflictToken: z.string().optional(),
});
export type CreateScheduleResponse = z.infer<typeof CreateScheduleResponse>;
