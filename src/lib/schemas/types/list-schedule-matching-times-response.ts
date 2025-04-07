import { z } from 'zod';

export const ListScheduleMatchingTimesResponse = z.object({
  startTime: z.array(z.string().datetime({ offset: true })).optional(),
});
export type ListScheduleMatchingTimesResponse = z.infer<
  typeof ListScheduleMatchingTimesResponse
>;
