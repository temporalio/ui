import { z } from 'zod';

/**
 * Range represents a set of integer values, used to match fields of a calendar
 *  time in StructuredCalendarSpec. If end < start, then end is interpreted as
 *  equal to start. This means you can use a Range with start set to a value, and
 *  end and step unset (defaulting to 0) to represent a single value.
 */
export const Range = z
  .object({
    /**Start of range (inclusive).*/
    start: z.number().int().describe('Start of range (inclusive).').optional(),
    /**End of range (inclusive).*/
    end: z.number().int().describe('End of range (inclusive).').optional(),
    /**Step (optional, default 1).*/
    step: z.number().int().describe('Step (optional, default 1).').optional(),
  })
  .describe(
    'Range represents a set of integer values, used to match fields of a calendar\n time in StructuredCalendarSpec. If end < start, then end is interpreted as\n equal to start. This means you can use a Range with start set to a value, and\n end and step unset (defaulting to 0) to represent a single value.',
  );
export type Range = z.infer<typeof Range>;
