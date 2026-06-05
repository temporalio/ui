import cronstrue from 'cronstrue';

import { sortNumStrings } from '$lib/utilities/array';
import { pluralize } from '$lib/utilities/pluralize';

import {
  DAYS_OF_MONTH,
  DAYS_OF_WEEK,
  DAYS_WITH_LABEL,
  durationUnits,
  intervalUnits,
  MONTHS,
  MONTHS_WITH_LABEL,
  WEEKDAYS,
  WEEKEND,
} from '../constants';
import { type ScheduleFormData } from '../schema';
import type { DayOfMonth, Month } from '../types';
import { getLargestWholeUnit } from './duration';

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
      time: {
        hour: undefined,
        minute: undefined,
      },
    },
    month: {
      type: 'month',
      daysOfMonth: [new Date().getDay().toString() as DayOfMonth],
      months: [(new Date().getMonth() + 1).toString() as Month],
      time: {
        hour: undefined,
        minute: undefined,
      },
    },
    interval: {
      type: 'interval',
      interval: undefined,
      phase: undefined,
    },
  };

  return initial[type] as Extract<Spec, { type: T }>;
}

const pad0ForTime = (num = 0): string => num.toString().padStart(2, '0');
const listFormatter = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
});

export function getSpecSummary(spec: Spec): string {
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
      const time = `${pad0ForTime(spec.time.hour)}:${pad0ForTime(spec.time.minute)} UTC`;

      if (DAYS_OF_WEEK.every((d) => selectedSet.has(d))) {
        return `Everyday at ${time}`;
      }

      if (WEEKDAYS.every((d) => selectedSet.has(d))) {
        return `Weekdays at ${time}`;
      }

      if (WEEKEND.every((d) => selectedSet.has(d))) {
        return `Weekends at ${time}`;
      }

      const sortedLabels = sortNumStrings(spec.daysOfWeek).map(
        (d) => DAYS_WITH_LABEL.find((withLabel) => d === withLabel.value).label,
      );

      return `Every ${listFormatter.format(sortedLabels)} at ${time}`;
    }

    case 'month': {
      const selectedMonthsSet = new Set(spec.months ?? []);

      const time = `${pad0ForTime(spec.time.hour)}:${pad0ForTime(spec.time.minute)} UTC`;

      const formatedDays = listFormatter.format(
        sortNumStrings(spec.daysOfMonth),
      );

      const selectedDaysSet = new Set(spec.daysOfMonth ?? []);
      const isEveryDay = DAYS_OF_MONTH.every((d) => selectedDaysSet.has(d));
      const daysStr = isEveryDay
        ? 'every day'
        : `${pluralize('day', spec.daysOfMonth.length)} ${formatedDays}`;

      if (MONTHS.every((m) => selectedMonthsSet.has(m))) {
        return `On ${daysStr} of every month at ${time}`;
      }

      const sortedMonthLabels = sortNumStrings(spec.months)
        .map(
          (m) =>
            MONTHS_WITH_LABEL.find((withLabel) => m === withLabel.value)?.label,
        )
        .filter(Boolean);

      const formatedMonthLabels = listFormatter.format(sortedMonthLabels);

      return `On ${daysStr} of ${formatedMonthLabels} at ${time}`;
    }

    case 'interval': {
      if (!spec.interval) {
        return '';
      }

      const largest = getLargestWholeUnit(spec.interval, intervalUnits);

      const offset = getLargestWholeUnit(spec.phase ?? '0s', durationUnits);

      return `Every ${largest.value} ${largest.unit.label} offset by ${offset.value} ${offset.unit.label}`;
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
