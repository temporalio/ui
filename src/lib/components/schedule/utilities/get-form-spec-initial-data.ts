import {
  type FormSpecKind,
  formSpecObject,
  type FormSpecSchema,
} from '../schema/form';

// Seeds carry only the fields meaningful for their kind; parsing through the
// bare object schema injects zod's defaults so the result is a complete
// FormSpecSchema (the same shape submit-time validation would produce).
export function getFormSpecInitialData(
  kind: Exclude<FormSpecKind, 'none' | 'frozen'>,
): FormSpecSchema {
  switch (kind) {
    case 'cron': {
      return formSpecObject.parse({
        kind: 'cron',
        cronString: '',
      });
    }

    case 'week': {
      return formSpecObject.parse({
        kind: 'week',
        calendar: {
          dayOfWeek: [{ start: new Date().getDay() }],
          hour: [],
          minute: [],
          second: [],
        },
      });
    }

    case 'month': {
      return formSpecObject.parse({
        kind: 'month',
        calendar: {
          dayOfMonth: [{ start: new Date().getDate() }],
          month: [{ start: new Date().getMonth() + 1 }],
        },
      });
    }

    case 'interval': {
      return formSpecObject.parse({
        kind: 'interval',
        interval: {
          interval: undefined,
          phase: undefined,
        },
      });
    }
  }
}
