import {
  HOURS as HOURS_UNIT,
  MINUTES as MINUTES_UNIT,
  SECONDS as SECONDS_UNIT,
  type Unit,
} from '$lib/holocene/duration-input/duration-input.svelte';
import { translate } from '$lib/i18n/translate';

import type { ScheduleFormData } from './schema';

type OverlapPolicy = ScheduleFormData['overlapPolicy'];

export const getOverlapPolicyContent = (): Record<
  OverlapPolicy,
  { isDefault?: boolean; label: string; description: string }
> => ({
  Skip: {
    isDefault: true,
    label: translate('schedules.overlap-skip-label'),
    description: translate('schedules.overlap-skip-description'),
  },
  BufferOne: {
    label: translate('schedules.overlap-buffer-one-label'),
    description: translate('schedules.overlap-buffer-one-description'),
  },
  BufferAll: {
    label: translate('schedules.overlap-buffer-all-label'),
    description: translate('schedules.overlap-buffer-all-description'),
  },
  CancelOther: {
    label: translate('schedules.overlap-cancel-other-label'),
    description: translate('schedules.overlap-cancel-other-description'),
  },
  TerminateOther: {
    label: translate('schedules.overlap-terminate-other-label'),
    description: translate('schedules.overlap-terminate-other-description'),
  },
  AllowAll: {
    label: translate('schedules.overlap-allow-all-label'),
    description: translate('schedules.overlap-allow-all-description'),
  },
});

const MONTHS_UNIT: Unit<'month(s)'> = {
  label: 'month(s)',
  convert: (n: number) => n * 31 * 24 * 60 * 60,
};

const DAYS_UNIT: Unit<'day(s)'> = {
  label: 'day(s)',
  convert: (n: number) => n * 24 * 60 * 60,
};

export const durationUnits = [
  MONTHS_UNIT,
  DAYS_UNIT,
  HOURS_UNIT,
  MINUTES_UNIT,
  SECONDS_UNIT,
];

export const intervalUnits = [
  DAYS_UNIT,
  HOURS_UNIT,
  MINUTES_UNIT,
  SECONDS_UNIT,
];

export const DAYS_OF_WEEK = ['0', '1', '2', '3', '4', '5', '6'] as const;
export const DAYS_OF_WEEK_SET = new Set<string>(
  DAYS_OF_WEEK as readonly string[],
);

export const DAYS_OF_MONTH = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
] as const;
export const DAYS_OF_MONTH_SET = new Set<string>(
  DAYS_OF_MONTH as readonly string[],
);

export const MONTHS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
] as const;
export const MONTHS_SET = new Set<string>(MONTHS as readonly string[]);

export const WEEKDAYS = ['1', '2', '3', '4', '5'] as const;
export const WEEKEND = ['0', '6'] as const;

export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_MINUTE = 60;
