import { format, parse } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export const toCalendarDateStr = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

export const getNowCalendarDateStr = () => toCalendarDateStr(new Date());

export const fromCalendarDateStr = (dateStr: string): Date =>
  parse(dateStr, 'yyyy-MM-dd', new Date());

// The boundary helpers anchor the calendar date to midnight of timezoneName so
// a displayed date means that date in the schedule's own timezone, independent
// of the viewer's local offset.
export const calendarDateStrToTimestamp = (dateStr: string, timeZone: string) =>
  zonedTimeToUtc(`${dateStr}T00:00:00`, timeZone).toISOString();

export const isoStringToCalendarDateStr = (isoStr: string, timeZone: string) =>
  format(utcToZonedTime(new Date(isoStr), timeZone), 'yyyy-MM-dd');
