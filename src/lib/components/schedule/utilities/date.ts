import { format, parse } from 'date-fns';

export const toCalendarDateStr = (date: Date): string =>
  format(date, 'yyyy-MM-dd');

export const getNowCalendarDateStr = () => toCalendarDateStr(new Date());

export const fromCalendarDateStr = (dateStr: string): Date =>
  parse(dateStr, 'yyyy-MM-dd', new Date());

// The boundary helpers pin the calendar date to UTC midnight so the stored
// instant — and the date read back — is the same in every timezone, rather
// than shifting with the viewer's local offset.
export const calendarDateStrToTimestamp = (dateStr: string) =>
  new Date(`${dateStr}T00:00:00.000Z`).toISOString();

export const isoStringToCalendarDateStr = (isoStr: string) =>
  new Date(isoStr).toISOString().slice(0, 10);
