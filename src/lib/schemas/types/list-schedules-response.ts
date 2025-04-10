import { z } from 'zod';

export const ListSchedulesResponse = z.object({
  schedules: z.array(z.any()).optional(),
  nextPageToken: z.string().optional(),
});
export type ListSchedulesResponse = z.infer<typeof ListSchedulesResponse>;
