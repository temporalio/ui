import { z } from 'zod';

/**
 * CalendarSpec describes an event specification relative to the calendar,
 *  similar to a traditional cron specification, but with labeled fields. Each
 *  field can be one of:
 *    *: matches always
 *    x: matches when the field equals x
 *    x/y : matches when the field equals x+n*y where n is an integer
 *    x-z: matches when the field is between x and z inclusive
 *    w,x,y,...: matches when the field is one of the listed values
 *  Each x, y, z, ... is either a decimal integer, or a month or day of week name
 *  or abbreviation (in the appropriate fields).
 *  A timestamp matches if all fields match.
 *  Note that fields have different default values, for convenience.
 *  Note that the special case that some cron implementations have for treating
 *  day_of_month and day_of_week as "or" instead of "and" when both are set is
 *  not implemented.
 *  day_of_week can accept 0 or 7 as Sunday
 *  CalendarSpec gets compiled into StructuredCalendarSpec, which is what will be
 *  returned if you describe the schedule.
 */
export const CalendarSpec = z
  .object({
    /**Expression to match seconds. Default: 0*/
    second: z
      .string()
      .describe('Expression to match seconds. Default: 0')
      .optional(),
    /**Expression to match minutes. Default: 0*/
    minute: z
      .string()
      .describe('Expression to match minutes. Default: 0')
      .optional(),
    /**Expression to match hours. Default: 0*/
    hour: z
      .string()
      .describe('Expression to match hours. Default: 0')
      .optional(),
    /**
     * Expression to match days of the month. Default: *
     *  (-- api-linter: core::0140::prepositions=disabled
     *      aip.dev/not-precedent: standard name of field --)
     */
    dayOfMonth: z
      .string()
      .describe(
        'Expression to match days of the month. Default: *\n (-- api-linter: core::0140::prepositions=disabled\n     aip.dev/not-precedent: standard name of field --)',
      )
      .optional(),
    /**Expression to match months. Default: **/
    month: z
      .string()
      .describe('Expression to match months. Default: *')
      .optional(),
    /**Expression to match years. Default: **/
    year: z
      .string()
      .describe('Expression to match years. Default: *')
      .optional(),
    /**Expression to match days of the week. Default: **/
    dayOfWeek: z
      .string()
      .describe('Expression to match days of the week. Default: *')
      .optional(),
    /**Free-form comment describing the intention of this spec.*/
    comment: z
      .string()
      .describe('Free-form comment describing the intention of this spec.')
      .optional(),
  })
  .describe(
    'CalendarSpec describes an event specification relative to the calendar,\n similar to a traditional cron specification, but with labeled fields. Each\n field can be one of:\n   *: matches always\n   x: matches when the field equals x\n   x/y : matches when the field equals x+n*y where n is an integer\n   x-z: matches when the field is between x and z inclusive\n   w,x,y,...: matches when the field is one of the listed values\n Each x, y, z, ... is either a decimal integer, or a month or day of week name\n or abbreviation (in the appropriate fields).\n A timestamp matches if all fields match.\n Note that fields have different default values, for convenience.\n Note that the special case that some cron implementations have for treating\n day_of_month and day_of_week as "or" instead of "and" when both are set is\n not implemented.\n day_of_week can accept 0 or 7 as Sunday\n CalendarSpec gets compiled into StructuredCalendarSpec, which is what will be\n returned if you describe the schedule.',
  );
export type CalendarSpec = z.infer<typeof CalendarSpec>;
