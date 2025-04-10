import { z } from 'zod';

export const RampByPercentage = z.object({
  /**Acceptable range is [0,100).*/
  rampPercentage: z
    .number()
    .describe('Acceptable range is [0,100).')
    .optional(),
});
export type RampByPercentage = z.infer<typeof RampByPercentage>;
