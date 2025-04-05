import type { ScheduleParameters } from '$lib/types/schedule';

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
  const month = months
    .sort((a: string, b: string) => parseInt(a) - parseInt(b))
    .join(',');
  const dayOfMonth = daysOfMonth
    .sort((a: number, b: number) => a - b)
    .join(',');
  const normalizedDaysOfWeek =
    daysOfWeek?.[0]?.split(',')?.length > 1
      ? daysOfWeek[0].split(',')
      : daysOfWeek;
  const dayOfWeek = normalizedDaysOfWeek
    .sort((a: string, b: string) => parseInt(a) - parseInt(b))
    .join(',');

  return { month, dayOfMonth, dayOfWeek };
};
