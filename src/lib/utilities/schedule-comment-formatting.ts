import { genericWeekDays, monthNames, weekDays } from './calendar';

// Every 3hrs:5min:20 sec 30 min offset
// Weekends at 12:00pm PST
// Sunday, Monday, Tuesday, Wednesday, Thursday, Friday at 12:00pm UTC
// Every 1, 15, 31 of the month at 12:00pm UTC
// Every 1, 15, 31 of January, March, April, June, July, September, December at 12:00pm UTC

export const calendarToComment = ({
  preset,
  month,
  dayOfMonth,
  dayOfWeek,
  hour,
  minute,
  second,
}: Partial<ScheduleParameters>): string => {
  let comment = '';
  if (preset === 'week') {
    const genericWeek = genericWeekDays.find(
      (template) => template.value === dayOfWeek,
    );
    const weekDay = weekDays.find((template) => template.value === dayOfWeek);
    if (genericWeek) {
      comment = `${genericWeek.label} at ${
        hour ? hour.padStart(2, '0') : '12'
      }:${(minute ? minute.padStart(2, '0') : '00') ?? '00'}`;
    } else {
      comment = `${weekDay.label} at ${hour ? hour.padStart(2, '0') : '12'}:${
        (minute ? minute.padStart(2, '0') : '00') ?? '00'
      }`;
    }
  } else if (preset === 'month') {
    const monthName = monthNames.find((template) => template.value === month);
    if (monthName) {
      if (monthName.value === '*') {
        comment = `Every ${dayOfMonth} of the month at ${
          hour ? hour.padStart(2, '0') : '12'
        }:${(minute ? minute.padStart(2, '0') : '00') ?? '00'}`;
      } else {
        comment = `Every ${dayOfMonth} of ${monthName.label} at ${
          hour ? hour.padStart(2, '0') : '12'
        }:${(minute ? minute.padStart(2, '0') : '00') ?? '00'}`;
      }
    }
  }

  return comment;
};

export const intervalToComment = ({
  interval,
  phase,
}: {
  interval: string;
  phase: string;
}): string => {
  let comment = '';
  const intervalAsNumber = parseInt(interval.slice(0, -1));

  let hour = Math.floor(intervalAsNumber / (60 * 60));
  let remainingSeconds =
    hour > 0 ? intervalAsNumber - hour * 60 * 60 : intervalAsNumber;
  let minute = Math.floor(remainingSeconds / 60);
  let second = minute > 0 ? remainingSeconds - minute * 60 : remainingSeconds;
  let minuteString = minute.toString();
  let secondString = second.toString();

  if (hour) {
    comment = `Every ${hour}hrs:${
      minute ? minuteString.padStart(2, '0') : '00'
    }min:${second ? secondString.padStart(2, '0') : '00'}sec`;
  } else if (minute) {
    comment = `Every ${minute ? minuteString.padStart(2, '0') : '00'}min:${
      second ? secondString.padStart(2, '0') : '00'
    }sec`;
  } else if (second) {
    comment = `Every ${second ? secondString.padStart(2, '0') : '00'}sec`;
  }

  // if (phase) {
  //   // TODO
  // }

  return comment;
};
