import { genericWeekDays, monthNames, weekDays } from './calendar';

// Examples of output
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
}: Partial<ScheduleParameters>): string => {
  let comment = '';
  if (preset === 'week') {
    const genericName = genericWeekDays.find(
      (template) => template.value === dayOfWeek,
    );
    if (genericName) {
      comment = `${genericName.label} at ${
        hour ? hour.padStart(2, '0') : '12'
      }:${(minute ? minute.padStart(2, '0') : '00') ?? '00'}`;
    } else {
      const split = dayOfWeek.split(',');
      const splitNames = split
        .map((d) => {
          const day = weekDays.find((day) => day.value === d);
          return day.label;
        })
        .join(', ');
      comment = `${splitNames} at ${hour ? hour.padStart(2, '0') : '12'}:${
        (minute ? minute.padStart(2, '0') : '00') ?? '00'
      }`;
    }
  } else if (preset === 'month') {
    if (month === '*') {
      comment = `Every ${dayOfMonth} of the month at ${
        hour ? hour.padStart(2, '0') : '12'
      }:${(minute ? minute.padStart(2, '0') : '00') ?? '00'}`;
    } else {
      const split = month.split(',');
      const splitNames = split
        .map((m) => {
          const _month = monthNames.find((_m) => _m.value === m);
          return _month.label;
        })
        .join(', ');
      comment = `Every ${dayOfMonth} of ${splitNames} at ${
        hour ? hour.padStart(2, '0') : '12'
      }:${(minute ? minute.padStart(2, '0') : '00') ?? '00'}`;
    }
  }

  return comment;
};

export const intervalToComment = (interval: string, offset = false): string => {
  let comment = '';
  const intervalAsNumber = parseInt(interval.slice(0, -1));

  let days = Math.floor(intervalAsNumber / (60 * 60 * 24));
  let remainingSeconds =
    intervalAsNumber - (days > 0 ? days * 60 * 60 * 24 : 0);
  let hour = Math.floor(remainingSeconds / (60 * 60));
  remainingSeconds = remainingSeconds - (hour > 0 ? hour * 60 * 60 : 0);
  let minute = Math.floor(remainingSeconds / 60);
  let second = minute > 0 ? remainingSeconds - minute * 60 : remainingSeconds;
  let hourString = hour.toString();
  let minuteString = minute.toString();
  let secondString = second.toString();

  const startingWord = offset ? 'Offset' : 'Every';
  if (days) {
    comment = `${startingWord} ${days}days:${
      hour ? hourString.padStart(2, '0') : '00'
    }hrs:${minute ? minuteString.padStart(2, '0') : '00'}min:${
      second ? secondString.padStart(2, '0') : '00'
    }sec`;
  } else if (hour) {
    comment = `${startingWord} ${hour}hrs:${
      minute ? minuteString.padStart(2, '0') : '00'
    }min:${second ? secondString.padStart(2, '0') : '00'}sec`;
  } else if (minute) {
    comment = `${startingWord} ${
      minute ? minuteString.padStart(2, '0') : '00'
    }min:${second ? secondString.padStart(2, '0') : '00'}sec`;
  } else if (second) {
    comment = `${startingWord} ${
      second ? secondString.padStart(2, '0') : '00'
    }sec`;
  }

  return comment;
};
