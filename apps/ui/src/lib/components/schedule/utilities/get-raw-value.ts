import { z } from 'zod/v3';

import { formSpecSchema } from '../schema/form';

export function getRawValue(specInput: z.input<typeof formSpecSchema>): string {
  const parsedSpec = formSpecSchema.safeParse(specInput);

  if (!parsedSpec.success) {
    return '';
  }

  const spec = parsedSpec.data;

  switch (spec.kind) {
    case 'cron': {
      return spec.cronString;
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

    case 'frozen': {
      return '';
    }

    case 'none': {
      return '';
    }
  }
}
