import i18next from 'i18next';

import { DAY_MS } from '$lib/utilities/time-units';

const SUNDAY_UTC = Date.UTC(1970, 0, 4);

export const getWeekdayLabel = (
  weekday: number,
  format: Intl.DateTimeFormatOptions['weekday'] = 'long',
): string =>
  new Intl.DateTimeFormat(i18next.language, {
    weekday: format,
    timeZone: 'UTC',
  }).format(new Date(SUNDAY_UTC + weekday * DAY_MS));

export const getMonthLabel = (
  month: number,
  format: Intl.DateTimeFormatOptions['month'] = 'long',
): string =>
  new Intl.DateTimeFormat(i18next.language, {
    month: format,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2021, month, 1)));
