import { z } from 'zod';

/**
 * ScheduleSpec is a complete description of a set of absolute timestamps
 *  (possibly infinite) that an action should occur at. The meaning of a
 *  ScheduleSpec depends only on its contents and never changes, except that the
 *  definition of a time zone can change over time (most commonly, when daylight
 *  saving time policy changes for an area). To create a totally self-contained
 *  ScheduleSpec, use UTC or include timezone_data.
 *
 *  For input, you can provide zero or more of: structured_calendar, calendar,
 *  cron_string, interval, and exclude_structured_calendar, and all of them will
 *  be used (the schedule will take action at the union of all of their times,
 *  minus the ones that match exclude_structured_calendar).
 *
 *  On input, calendar and cron_string fields will be compiled into
 *  structured_calendar (and maybe interval and timezone_name), so if you
 *  Describe a schedule, you'll see only structured_calendar, interval, etc.
 *
 *  If a spec has no matching times after the current time, then the schedule
 *  will be subject to automatic deletion (after several days).
 */
export const ScheduleSpec = z
  .object({
    /**Calendar-based specifications of times.*/
    structuredCalendar: z
      .array(z.any())
      .describe('Calendar-based specifications of times.')
      .optional(),
    /**
     * cron_string holds a traditional cron specification as a string. It
     *  accepts 5, 6, or 7 fields, separated by spaces, and interprets them the
     *  same way as CalendarSpec.
     *  5 fields:         minute, hour, day_of_month, month, day_of_week
     *  6 fields:         minute, hour, day_of_month, month, day_of_week, year
     *  7 fields: second, minute, hour, day_of_month, month, day_of_week, year
     *  If year is not given, it defaults to *. If second is not given, it
     *  defaults to 0.
     *  Shorthands @yearly, @monthly, @weekly, @daily, and @hourly are also
     *  accepted instead of the 5-7 time fields.
     *  Optionally, the string can be preceded by CRON_TZ=<timezone name> or
     *  TZ=<timezone name>, which will get copied to timezone_name. (There must
     *  not also be a timezone_name present.)
     *  Optionally "#" followed by a comment can appear at the end of the string.
     *  Note that the special case that some cron implementations have for
     *  treating day_of_month and day_of_week as "or" instead of "and" when both
     *  are set is not implemented.
     *  @every <interval>[/<phase>] is accepted and gets compiled into an
     *  IntervalSpec instead. <interval> and <phase> should be a decimal integer
     *  with a unit suffix s, m, h, or d.
     */
    cronString: z
      .array(z.string())
      .describe(
        'cron_string holds a traditional cron specification as a string. It\n accepts 5, 6, or 7 fields, separated by spaces, and interprets them the\n same way as CalendarSpec.\n 5 fields:         minute, hour, day_of_month, month, day_of_week\n 6 fields:         minute, hour, day_of_month, month, day_of_week, year\n 7 fields: second, minute, hour, day_of_month, month, day_of_week, year\n If year is not given, it defaults to *. If second is not given, it\n defaults to 0.\n Shorthands @yearly, @monthly, @weekly, @daily, and @hourly are also\n accepted instead of the 5-7 time fields.\n Optionally, the string can be preceded by CRON_TZ=<timezone name> or\n TZ=<timezone name>, which will get copied to timezone_name. (There must\n not also be a timezone_name present.)\n Optionally "#" followed by a comment can appear at the end of the string.\n Note that the special case that some cron implementations have for\n treating day_of_month and day_of_week as "or" instead of "and" when both\n are set is not implemented.\n @every <interval>[/<phase>] is accepted and gets compiled into an\n IntervalSpec instead. <interval> and <phase> should be a decimal integer\n with a unit suffix s, m, h, or d.',
      )
      .optional(),
    /**Calendar-based specifications of times.*/
    calendar: z
      .array(z.any())
      .describe('Calendar-based specifications of times.')
      .optional(),
    /**Interval-based specifications of times.*/
    interval: z
      .array(z.any())
      .describe('Interval-based specifications of times.')
      .optional(),
    /**Any timestamps matching any of exclude_* will be skipped.*/
    excludeCalendar: z
      .array(z.any())
      .describe('Any timestamps matching any of exclude_* will be skipped.')
      .optional(),
    excludeStructuredCalendar: z.array(z.any()).optional(),
    /**
     * If start_time is set, any timestamps before start_time will be skipped.
     *  (Together, start_time and end_time make an inclusive interval.)
     */
    startTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'If start_time is set, any timestamps before start_time will be skipped.\n (Together, start_time and end_time make an inclusive interval.)',
      )
      .optional(),
    /**If end_time is set, any timestamps after end_time will be skipped.*/
    endTime: z
      .string()
      .datetime({ offset: true })
      .describe(
        'If end_time is set, any timestamps after end_time will be skipped.',
      )
      .optional(),
    /**
     * All timestamps will be incremented by a random value from 0 to this
     *  amount of jitter. Default: 0
     */
    jitter: z
      .string()
      .regex(new RegExp('^-?(?:0|[1-9][0-9]{0,11})(?:\\.[0-9]{1,9})?s$'))
      .describe(
        'All timestamps will be incremented by a random value from 0 to this\n amount of jitter. Default: 0',
      )
      .optional(),
    /**
     * Time zone to interpret all calendar-based specs in.
     *
     *  If unset, defaults to UTC. We recommend using UTC for your application if
     *  at all possible, to avoid various surprising properties of time zones.
     *
     *  Time zones may be provided by name, corresponding to names in the IANA
     *  time zone database (see https://www.iana.org/time-zones). The definition
     *  will be loaded by the Temporal server from the environment it runs in.
     *
     *  If your application requires more control over the time zone definition
     *  used, it may pass in a complete definition in the form of a TZif file
     *  from the time zone database. If present, this will be used instead of
     *  loading anything from the environment. You are then responsible for
     *  updating timezone_data when the definition changes.
     *
     *  Calendar spec matching is based on literal matching of the clock time
     *  with no special handling of DST: if you write a calendar spec that fires
     *  at 2:30am and specify a time zone that follows DST, that action will not
     *  be triggered on the day that has no 2:30am. Similarly, an action that
     *  fires at 1:30am will be triggered twice on the day that has two 1:30s.
     *
     *  Also note that no actions are taken on leap-seconds (e.g. 23:59:60 UTC).
     */
    timezoneName: z
      .string()
      .describe(
        'Time zone to interpret all calendar-based specs in.\n\n If unset, defaults to UTC. We recommend using UTC for your application if\n at all possible, to avoid various surprising properties of time zones.\n\n Time zones may be provided by name, corresponding to names in the IANA\n time zone database (see https://www.iana.org/time-zones). The definition\n will be loaded by the Temporal server from the environment it runs in.\n\n If your application requires more control over the time zone definition\n used, it may pass in a complete definition in the form of a TZif file\n from the time zone database. If present, this will be used instead of\n loading anything from the environment. You are then responsible for\n updating timezone_data when the definition changes.\n\n Calendar spec matching is based on literal matching of the clock time\n with no special handling of DST: if you write a calendar spec that fires\n at 2:30am and specify a time zone that follows DST, that action will not\n be triggered on the day that has no 2:30am. Similarly, an action that\n fires at 1:30am will be triggered twice on the day that has two 1:30s.\n\n Also note that no actions are taken on leap-seconds (e.g. 23:59:60 UTC).',
      )
      .optional(),
    timezoneData: z.string().optional(),
  })
  .describe(
    "ScheduleSpec is a complete description of a set of absolute timestamps\n (possibly infinite) that an action should occur at. The meaning of a\n ScheduleSpec depends only on its contents and never changes, except that the\n definition of a time zone can change over time (most commonly, when daylight\n saving time policy changes for an area). To create a totally self-contained\n ScheduleSpec, use UTC or include timezone_data.\n\n For input, you can provide zero or more of: structured_calendar, calendar,\n cron_string, interval, and exclude_structured_calendar, and all of them will\n be used (the schedule will take action at the union of all of their times,\n minus the ones that match exclude_structured_calendar).\n\n On input, calendar and cron_string fields will be compiled into\n structured_calendar (and maybe interval and timezone_name), so if you\n Describe a schedule, you'll see only structured_calendar, interval, etc.\n\n If a spec has no matching times after the current time, then the schedule\n will be subject to automatic deletion (after several days).",
  );
export type ScheduleSpec = z.infer<typeof ScheduleSpec>;
