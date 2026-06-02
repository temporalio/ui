import { type Readable } from 'svelte/store';

import cronstrue from 'cronstrue';

import {
  type FormatDateOptions,
  type ValidTime,
} from '$lib/utilities/format-date';

import { type ScheduleFormData } from '../schema';
type FormatDateFn = (date: ValidTime, options: FormatDateOptions) => string;
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Spec = ScheduleFormData['specs'][number];

export function getSpecSummary(spec: Spec, formatDate: FormatDateFn): string {
  if (!spec) {
    return '';
  }

  switch (spec.type) {
    case 'cron': {
      try {
        return cronstrue.toString(spec.cronString || '* * * * *');
      } catch {
        return '';
      }
    }

    case 'week': {
      return '';
    }

    case 'month': {
      return '';
    }

    case 'interval': {
      return '';
    }

    default: {
      return '';
    }
  }
}

export function getValue(spec?: Spec): string {
  if (!spec) {
    return '';
  }

  switch (spec.type) {
    case 'cron': {
      return (spec.cronString || '* * * * *').replaceAll(/\s+/, ' '); // replace all whitespace with non-breaking-space
    }

    case 'week': {
      return '';
    }

    case 'month': {
      return '';
    }

    case 'interval': {
      return '';
    }

    default: {
      return '';
    }
  }
}
