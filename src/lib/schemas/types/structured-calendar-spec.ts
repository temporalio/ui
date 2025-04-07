import { z } from 'zod';

/**
 * StructuredCalendarSpec describes an event specification relative to the
 *  calendar, in a form that's easy to work with programmatically. Each field can
 *  be one or more ranges.
 *  A timestamp matches if at least one range of each field matches the
 *  corresponding fields of the timestamp, except for year: if year is missing,
 *  that means all years match. For all fields besides year, at least one Range
 *  must be present to match anything.
 *  TODO: add relative-to-end-of-month
 *  TODO: add nth day-of-week in month
 */
export const StructuredCalendarSpec = z
  .object({
    /**Match seconds (0-59)*/
    second: z.array(z.any()).describe('Match seconds (0-59)').optional(),
    /**Match minutes (0-59)*/
    minute: z.array(z.any()).describe('Match minutes (0-59)').optional(),
    /**Match hours (0-23)*/
    hour: z.array(z.any()).describe('Match hours (0-23)').optional(),
    /**
     * Match days of the month (1-31)
     *  (-- api-linter: core::0140::prepositions=disabled
     *      aip.dev/not-precedent: standard name of field --)
     */
    dayOfMonth: z
      .array(z.any())
      .describe(
        'Match days of the month (1-31)\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: standard name of field --)',
      )
      .optional(),
    /**Match months (1-12)*/
    month: z.array(z.any()).describe('Match months (1-12)').optional(),
    /**Match years.*/
    year: z.array(z.any()).describe('Match years.').optional(),
    /**Match days of the week (0-6; 0 is Sunday).*/
    dayOfWeek: z
      .array(z.any())
      .describe('Match days of the week (0-6; 0 is Sunday).')
      .optional(),
    /**Free-form comment describing the intention of this spec.*/
    comment: z
      .string()
      .describe('Free-form comment describing the intention of this spec.')
      .optional(),
  })
  .describe(
    "StructuredCalendarSpec describes an event specification relative to the\n calendar, in a form that's easy to work with programmatically. Each field can\n be one or more ranges.\n A timestamp matches if at least one range of each field matches the\n corresponding fields of the timestamp, except for year: if year is missing,\n that means all years match. For all fields besides year, at least one Range\n must be present to match anything.\n TODO: add relative-to-end-of-month\n TODO: add nth day-of-week in month",
  );
export type StructuredCalendarSpec = z.infer<typeof StructuredCalendarSpec>;
