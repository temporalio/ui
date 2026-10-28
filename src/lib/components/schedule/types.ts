import type { DAYS_OF_MONTH, DAYS_OF_WEEK, MONTHS } from './constants';
import type { ScheduledActionFormData } from './scheduled-action-types/types';
import type { FormScheduleSchema } from './schema/form';

export type { DurationString } from '$lib/types/schedule';

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type DayOfMonth = (typeof DAYS_OF_MONTH)[number];
export type Month = (typeof MONTHS)[number];

export type ScheduleFormData = {
  schedule: FormScheduleSchema;
  action: ScheduledActionFormData;
};
