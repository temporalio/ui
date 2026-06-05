import cronstrue from 'cronstrue';

import { getMonthLabel, getWeekdayLabel } from '$lib/i18n/format-date-names';
import { formatList } from '$lib/i18n/format-list';
import { translate } from '$lib/i18n/translate';
import { sortNumStrings } from '$lib/utilities/array';

import {
  DAYS_OF_MONTH,
  DAYS_OF_WEEK,
  durationUnits,
  intervalUnits,
  MONTHS,
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
        return translate('schedules.spec-summary-everyday', { time });
      }

      if (WEEKDAYS.every((d) => selectedSet.has(d))) {
        return translate('schedules.spec-summary-weekdays', { time });
      }

      if (WEEKEND.every((d) => selectedSet.has(d))) {
        return translate('schedules.spec-summary-weekends', { time });
      }

      const sortedLabels = sortNumStrings(spec.daysOfWeek).map((d) =>
        getWeekdayLabel(Number(d)),
      );

      return translate('schedules.spec-summary-week', {
        days: formatList(sortedLabels),
        time,
      });
    }

    case 'month': {
      const selectedMonthsSet = new Set(spec.months ?? []);

      const time = `${pad0ForTime(spec.time.hour)}:${pad0ForTime(spec.time.minute)} UTC`;

      const formatedDays = formatList(sortNumStrings(spec.daysOfMonth));

      const selectedDaysSet = new Set(spec.daysOfMonth ?? []);
      const isEveryDay = DAYS_OF_MONTH.every((d) => selectedDaysSet.has(d));
      const daysStr = isEveryDay
        ? translate('schedules.spec-summary-every-day')
        : translate('schedules.spec-summary-days', {
            count: spec.daysOfMonth.length,
            days: formatedDays,
          });

      if (MONTHS.every((m) => selectedMonthsSet.has(m))) {
        return translate('schedules.spec-summary-month-every', {
          days: daysStr,
          time,
        });
      }

      const sortedMonthLabels = sortNumStrings(spec.months).map((m) =>
        getMonthLabel(Number(m) - 1),
      );

      return translate('schedules.spec-summary-month', {
        days: daysStr,
        months: formatList(sortedMonthLabels),
        time,
      });
    }

    case 'interval': {
      if (!spec.interval) {
        return '';
      }

      const largest = getLargestWholeUnit(spec.interval, intervalUnits);

      const offset = getLargestWholeUnit(spec.phase ?? '0s', durationUnits);

      return translate('schedules.spec-summary-interval', {
        interval: largest.value,
        intervalUnit: largest.unit.label,
        offset: offset.value,
        offsetUnit: offset.unit.label,
      });
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
