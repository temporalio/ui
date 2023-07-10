import type { ScheduleRange, StructuredCalendar } from '$lib/types/schedule';

import { monthNames, weekDays } from './calendar';

// Examples of output
// Wednesday at 06:30pm UTC
// Sunday, Monday, Tuesday, Wednesday, Thursday, Friday at 12:00pm UTC
// Every 1, 15, 31 of the month at 12:00pm UTC
// Every 1, 15, 31 of January, March, April, June, July, September, December at 12:00pm UTC

const isDailyForTheMonth = (calendar: StructuredCalendar) => {
  return (
    calendar.dayOfMonth?.length === 1 &&
    calendar.dayOfMonth[0]?.start === 1 &&
    calendar.dayOfMonth[0]?.end === 31
  );
};

const isDailyForTheWeek = (calendar: StructuredCalendar) => {
  return (
    calendar.dayOfWeek?.length === 1 &&
    calendar.dayOfWeek[0]?.start === 0 &&
    calendar.dayOfWeek[0]?.end === 6
  );
};

const isMonthly = (calendar: StructuredCalendar) => {
  return (
    calendar?.month.length === 1 &&
    calendar?.month[0]?.start === 1 &&
    calendar?.month[0]?.end === 12
  );
};

const isDaily = (calendar: StructuredCalendar) => {
  return isDailyForTheWeek(calendar) && isDailyForTheMonth(calendar);
};

const usingDaysOfTheWeek = (calendar: StructuredCalendar) => {
  return !isDailyForTheWeek(calendar) && isDailyForTheMonth(calendar);
};

const usingDaysOfTheMonth = (calendar: StructuredCalendar) => {
  return isDailyForTheWeek(calendar) && !isDailyForTheMonth(calendar);
};

const getDayLabelOfTheWeek = (dayNumber: number) => {
  const day = weekDays.find((n) => {
    if (dayNumber === 0) {
      return n.value === '7';
    } else {
      return n.value === dayNumber.toString();
    }
  });

  return day?.label;
};

const getDaysOfWeek = (calendar: StructuredCalendar) => {
  const range: ScheduleRange[] = calendar.dayOfWeek;
  let days = '';

  if (range.length) {
    for (let i = 0; i < range.length; i++) {
      const dayRange = range[i];
      if (dayRange?.start === dayRange?.end) {
        const day = getDayLabelOfTheWeek(dayRange.start);
        if (days) {
          days += `, ${day}`;
        } else {
          days = day;
        }
      } else {
        const startDay = getDayLabelOfTheWeek(dayRange.start);
        const endDay = getDayLabelOfTheWeek(dayRange.end);
        if (days) {
          days += `, ${startDay} - ${endDay}`;
        } else {
          days = `${startDay} - ${endDay}`;
        }
      }
    }
  }

  return days;
};

const getDaysOfMonth = (calendar: StructuredCalendar) => {
  const range: ScheduleRange[] = calendar.dayOfMonth;
  let days = '';

  if (range.length) {
    for (let i = 0; i < range.length; i++) {
      const dayRange = range[i];
      if (dayRange?.start === dayRange?.end) {
        if (days) {
          days += `, ${dayRange?.start}`;
        } else {
          days = dayRange?.start.toString();
        }
      }
    }
  }

  return days;
};

const getLabelOfTheMonth = (monthNumber: number) => {
  const month = monthNames.find(
    (month) => month.value === monthNumber.toString(),
  );
  return month?.label;
};

const getMonths = (calendar: StructuredCalendar) => {
  const range: ScheduleRange[] = calendar.month;
  let months = '';

  if (isMonthly(calendar)) {
    months = 'the month';
  } else if (range?.length) {
    for (let i = 0; i < range.length; i++) {
      const monthRange = range[i];
      if (monthRange?.start === monthRange?.end) {
        const month = getLabelOfTheMonth(monthRange.start);
        if (months) {
          months += `, ${month}`;
        } else {
          months = month;
        }
      } else {
        const startMonth = getLabelOfTheMonth(monthRange.start);
        const endMonth = getLabelOfTheMonth(monthRange.end);
        if (months) {
          months += `, ${startMonth} - ${endMonth}`;
        } else {
          months = `${startMonth} - ${endMonth}`;
        }
      }
    }
  }

  return months;
};

const getHour = (calendar: StructuredCalendar) => {
  const range: ScheduleRange[] = calendar.hour;
  let hour = 12;
  let amOrpm = 'am';

  if (range?.length) {
    const hourRange = range[0];
    if (hourRange?.start === hourRange?.end) {
      if (hourRange.start < 12) {
        hour = hourRange.start === 0 ? 12 : hourRange.start;
        amOrpm = 'am';
      } else if (hourRange.start === 12) {
        hour = hourRange.start;
        amOrpm = 'pm';
      } else {
        hour = hourRange.start - 12;
        amOrpm = 'pm';
      }
    }
  }

  return { hour: hour.toString().padStart(2, '0'), amOrpm };
};

const getMinute = (calendar: StructuredCalendar) => {
  const range: ScheduleRange[] = calendar.minute;
  let minute = 0;

  if (range?.length) {
    const minuteRange = range[0];
    if (minuteRange?.start === minuteRange?.end) {
      minute = minuteRange.start;
    }
  }

  return minute.toString().padStart(2, '0');
};

const getTime = (calendar: StructuredCalendar) => {
  const { hour, amOrpm } = getHour(calendar);
  const minute = getMinute(calendar);
  if (hour) {
    return `${hour}:${minute}${amOrpm} UTC`;
  }
};

export const structuredCalendarToFrequency = (
  calendar: StructuredCalendar,
): string => {
  const time = getTime(calendar);

  if (isDaily(calendar)) {
    return `Daily at ${time}`;
  } else if (usingDaysOfTheWeek(calendar)) {
    return `${getDaysOfWeek(calendar)} at ${time}`;
  } else if (usingDaysOfTheMonth(calendar)) {
    return `Every ${getDaysOfMonth(calendar)} of ${getMonths(
      calendar,
    )} at ${time}`;
  }

  return '';
};

export const commentOrCalendarToFrequency = (calendar: StructuredCalendar) => {
  if (calendar?.comment) return `${calendar?.comment} UTC`;
  return structuredCalendarToFrequency(calendar);
};
