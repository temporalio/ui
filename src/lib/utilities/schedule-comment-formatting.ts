import type { ScheduleParameters } from '$lib/types/schedule';

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
  const time = !hour || !parseInt(hour) || parseInt(hour) < 12 ? 'am' : 'pm';
  const properHour =
    !hour || !parseInt(hour)
      ? '12'
      : parseInt(hour) <= 12
      ? hour
      : (parseInt(hour) - 12).toString();
  const timeStamp = `${properHour.padStart(2, '0')}:${
    minute ? minute.padStart(2, '0') : '00'
  }${time}`;

  if (preset === 'week') {
    const genericName = genericWeekDays.find(
      (template) => template.value === dayOfWeek,
    );
    if (genericName) {
      comment = `${genericName.label} at ${timeStamp}`;
    } else {
      const split = dayOfWeek.split(',');
      const splitNames = split
        .map((d) => {
          const day = weekDays.find((day) => day.value === d);
          return day.label;
        })
        .join(', ');
      comment = `${splitNames} at ${timeStamp}`;
    }
  } else if (preset === 'month') {
    if (month === '*') {
      comment = `Every ${dayOfMonth} of the month at ${timeStamp}`;
    } else {
      const split = month.split(',');
      const splitNames = split
        .map((m) => {
          const _month = monthNames.find((_m) => _m.value === m);
          return _month.label;
        })
        .join(', ');
      comment = `Every ${dayOfMonth} of ${splitNames} at ${timeStamp}`;
    }
  }

  return comment;
};

export const intervalToComment = (interval = '', offset = false): string => {
  let comment = '';
  if (!interval) return comment;

  const intervalAsNumber = parseInt(interval.slice(0, -1));

  const days = Math.floor(intervalAsNumber / (60 * 60 * 24));
  let remainingSeconds =
    intervalAsNumber - (days > 0 ? days * 60 * 60 * 24 : 0);
  const hour = Math.floor(remainingSeconds / (60 * 60));
  remainingSeconds = remainingSeconds - (hour > 0 ? hour * 60 * 60 : 0);
  const minute = Math.floor(remainingSeconds / 60);
  const second = minute > 0 ? remainingSeconds - minute * 60 : remainingSeconds;

  const hourLabel = `${hour ? hour.toString().padStart(2, '0') : '00'}hrs`;
  const minuteLabel = `${
    minute ? minute.toString().padStart(2, '0') : '00'
  }min`;
  const secondLabel = `${
    second ? second.toString().padStart(2, '0') : '00'
  }sec`;

  const startingWord = offset ? 'Offset' : 'Every';
  if (days) {
    comment = `${startingWord} ${days}days:${hourLabel}:${minuteLabel}:${secondLabel}`;
  } else if (hour) {
    comment = `${startingWord} ${hourLabel}:${minuteLabel}:${secondLabel}`;
  } else if (minute) {
    comment = `${startingWord} ${minuteLabel}:${secondLabel}`;
  } else if (second) {
    comment = `${startingWord} ${secondLabel}`;
  }

  return comment;
};
