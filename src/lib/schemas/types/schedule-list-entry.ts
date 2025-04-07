import { z } from 'zod';

/**ScheduleListEntry is returned by ListSchedules.*/
export const ScheduleListEntry = z
  .object({
    scheduleId: z.string().optional(),
    memo: z.any().optional(),
    searchAttributes: z.any().optional(),
    info: z.any().optional(),
  })
  .describe('ScheduleListEntry is returned by ListSchedules.');
export type ScheduleListEntry = z.infer<typeof ScheduleListEntry>;
