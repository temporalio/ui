import { type FormSpecKind, type FormSpecSchema } from '../schema/form';

export function getFormSpecInitialData(
  kind: Exclude<FormSpecKind, 'none' | 'frozen'>,
): FormSpecSchema {
  switch (kind) {
    case 'cron': {
      return {
        kind: 'cron',
        cronString: '',
      } satisfies FormSpecSchema;
    }

    case 'week': {
      return {
        kind: 'week',
        calendar: {
          dayOfWeek: [{ start: new Date().getDay() }],
          hour: [],
          minute: [],
          second: [],
        },
      } satisfies FormSpecSchema;
    }

    case 'month': {
      return {
        kind: 'month',
        calendar: {
          dayOfMonth: [{ start: new Date().getDate() }],
          month: [{ start: new Date().getMonth() + 1 }],
        },
      };
    }

    case 'interval': {
      return {
        kind: 'interval',
        interval: {
          interval: undefined,
          phase: undefined,
        },
      };
    }
  }
}
