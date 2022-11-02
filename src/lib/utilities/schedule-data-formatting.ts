const parseTime = (time: string) => (time ? parseInt(time) : 0);

export const timeToInterval = (
  days: string,
  hour: string,
  minute: string,
  second: string,
) => {
  const interval =
    parseTime(days) * 60 * 60 * 24 +
    parseTime(hour) * 60 * 60 +
    parseTime(minute) * 60 +
    parseTime(second);
  return `${interval}s`;
};

export const convertDaysAndMonths = ({
  months = [],
  daysOfMonth = [],
  daysOfWeek = [],
}: Partial<ScheduleParameters>): Partial<ScheduleParameters> => {
  const month = months.sort((a, b) => parseInt(a) - parseInt(b)).join(',');
  const dayOfMonth = daysOfMonth.sort((a, b) => a - b).join(',');
  const normalizedDaysOfWeek =
    daysOfWeek?.[0]?.split(',')?.length > 1
      ? daysOfWeek[0].split(',')
      : daysOfWeek;
  const dayOfWeek = normalizedDaysOfWeek
    .sort((a, b) => parseInt(a) - parseInt(b))
    .join(',');

  return { month, dayOfMonth, dayOfWeek };
};

const convertStructuredRange = (ranges: any[]) => {
  let output: string[] = [];
  for (let range of ranges) {
    let string = range.start.toString();
    if (range.end > range.start) {
      const startToEnd = [];
      for (let i = range.start; i <= range.end; i++) {
        startToEnd.push(i);
      }
      string = startToEnd.join(',');
    }
    output.push(string);
    // Don't handle step for now
  }

  return output.join(',');
};

export const convertStructuredCalendar = (structuredCalendar: any) => {
  const calendar = {
    // daysOfWeek: string[] = [];
    // daysOfMonth: number[] = [];
    // months: string[] = [];
    second: convertStructuredRange(structuredCalendar.second),
    minute: convertStructuredRange(structuredCalendar.minute),
    hour: convertStructuredRange(structuredCalendar.hour),
    // days: convertStructuredRange(structuredCalendar)
    dayOfMonth: convertStructuredRange(structuredCalendar.dayOfMonth),
    dayOfWeek: convertStructuredRange(structuredCalendar.dayOfWeek),
    month: convertStructuredRange(structuredCalendar.month),
    // cronString: structuredCalendar.cronString[0],
    // interval: structuredCalendar.spec.interval[0],
  };
  return calendar;
};
