import cronstrue from 'cronstrue';

import {
  type FormatDateOptions,
  type ValidTime,
} from '$lib/utilities/format-date';

import { DAYS_OF_WEEK, DAYS_WITH_LABEL, WEEKDAYS, WEEKEND } from '../constants';
import { type ScheduleFormData } from '../schema';
import type { DayOfMonth, Month } from '../types';

type FormatDateFn = (date: ValidTime, options: FormatDateOptions) => string;

type Spec = ScheduleFormData['specs'][number];

// The need for this function is due to the tsconfig not enabling strict null checks
// with zod if the feature is off all fields are optional which makes discrimated unions...
// not work very well.
export function assertSpecType<T extends Spec['type']>(
  spec: Spec,
  type: T,
): Spec & { type: T } {
  if (type !== spec.type) {
    throw new TypeError(`Spec is not of type: ${type}`);
  }

  return spec as Spec & { type: T };
}

export function getInitialSpecData<T extends Spec['type']>(
  type: T,
): Extract<Spec, { type: T }> {
  const initial: Record<Spec['type'], Spec> = {
    cron: {
      type: 'cron',
      cronString: '',
    },
    week: {
      type: 'week',
      daysOfWeek: [...DAYS_OF_WEEK],
      hour: undefined,
      minute: undefined,
    },
    month: {
      type: 'month',
      daysOfMonth: [new Date().getDay().toString() as DayOfMonth],
      months: [(new Date().getMonth() + 1).toString() as Month],
      hour: 0,
      minute: 0,
    },
    interval: {
      type: 'interval',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      phase: '0s',
    },
  };

  return initial[type] as Extract<Spec, { type: T }>;
}

export function getSpecSummary(spec: Spec, formatDate: FormatDateFn): string {
  if (!spec) {
    return '';
  }

  switch (spec.type) {
    case 'cron': {
      try {
        return cronstrue.toString(spec.cronString || '* * * * *', {
          verbose: true,
        });
      } catch {
        return '';
      }
    }

    case 'week': {
      const selectedSet = new Set(spec.daysOfWeek ?? []);
      const pad0 = (num = 0): string => num.toString().padStart(2, '0');
      const time = `${pad0(spec.hour)}:${pad0(spec.minute)} UTC`;

      if (DAYS_OF_WEEK.every((d) => selectedSet.has(d))) {
        return `Everyday at ${time}.`;
      }

      if (WEEKDAYS.every((d) => selectedSet.has(d))) {
        return `Weekdays at ${time}.`;
      }

      if (WEEKEND.every((d) => selectedSet.has(d))) {
        return `Weekends at ${time}`;
      }

      return `Every ${spec.daysOfWeek.map((d) => DAYS_WITH_LABEL.find((withLabel) => d === withLabel.value).label)} at ${time}.`;
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

export function getRawValue(spec: Spec): string {
  if (!spec) {
    return '';
  }

  switch (spec.type) {
    case 'cron': {
      return (spec.cronString || '* * * * *').replaceAll(/\s+/g, ' '); // replace all whitespace with non-breaking-space
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
