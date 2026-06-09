import type { DAYS_OF_MONTH, DAYS_OF_WEEK, MONTHS } from './constants';

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type DayOfMonth = (typeof DAYS_OF_MONTH)[number];
export type Month = (typeof MONTHS)[number];

export type DurationString = `${number}s`;
