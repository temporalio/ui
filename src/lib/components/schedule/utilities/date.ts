import { format, parse } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const toCalendarDateStr = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

export const getNowCalendarDateStr = () => toCalendarDateStr(new Date());

export const fromCalendarDateStr = (dateStr: string): Date =>
  parse(dateStr, 'yyyy-MM-dd', new Date());

// The boundary helpers anchor the calendar date to a clock time of timezoneName
// so a displayed date means that date in the schedule's own timezone,
// independent of the viewer's local offset. Start dates anchor to midnight and
// end dates to end-of-day, since startTime/endTime form an inclusive interval.
export const calendarDateStrToTimestamp = (dateStr: string, timeZone: string) =>
  zonedTimeToUtc(`${dateStr}T00:00:00`, timeZone).toISOString();

export const calendarDateStrToEndOfDayTimestamp = (
  dateStr: string,
  timeZone: string,
) => zonedTimeToUtc(`${dateStr}T23:59:59`, timeZone).toISOString();

export const isoStringToCalendarDateStr = (isoStr: string, timeZone: string) =>
  format(utcToZonedTime(new Date(isoStr), timeZone), 'yyyy-MM-dd');
