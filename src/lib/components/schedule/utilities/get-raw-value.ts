import { z } from 'zod/v3';

import { formScheduleTimingSchema, formSpecSchema } from '../schema/form';

export function getRawValue(
  specInput: z.input<typeof formSpecSchema>,
  timinginput: z.input<typeof formScheduleTimingSchema>,
): string {
  const parsedSpec = formSpecSchema.safeParse(specInput);
  const parsedTiming = formScheduleTimingSchema.safeParse(timinginput);

  if (!parsedSpec.success || !parsedTiming.success) {
    return '';
  }

  const spec = parsedSpec.data;
  const timing = parsedTiming.data;

  switch (spec.kind) {
    case 'cron': {
      return spec.cronString;
    }

    case 'week': {
      return 'week';
    }

    case 'month': {
      return 'month';
    }

    case 'interval': {
      return 'interval';
    }

    case 'frozen': {
      return '';
    }

    case 'none': {
      return '';
    }
  }
}
