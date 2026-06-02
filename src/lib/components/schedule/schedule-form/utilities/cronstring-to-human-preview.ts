import cronstrue from 'cronstrue';

import { pluralize } from '$lib/utilities/pluralize';

import type { ScheduleFormData } from '../schema';

type PreviewOptions = Pick<
  ScheduleFormData,
  | 'startDate'
  | 'timezoneName'
  | 'endDateType'
  | 'endDate'
  | 'endAfterOccurrences'
>;

export function cronToHumanPreview(
  cronstring: string,
  opts: PreviewOptions,
): string {
  const previewSegments: string[] = [];

  try {
    previewSegments.push(cronstrue.toString(cronstring, { verbose: true }));

    switch (opts.endDateType) {
      case 'never': {
        previewSegments.push('until schedule deleted');
        break;
      }
      case 'after': {
        if (opts.endAfterOccurrences != null) {
          previewSegments.push(
            `until ${opts.endAfterOccurrences} ${pluralize('occurence', opts.endAfterOccurrences)}`,
          );
        }
        break;
      }
      case 'on': {
        if (opts.endDate) {
          previewSegments.push(`until ${opts.endDate}`);
        }
      }
    }

    if (opts.startDate) {
      previewSegments.push(`starting ${opts.startDate}`);
    }

    return previewSegments.join(' ');
  } catch {
    return 'Invalid cron expression';
  }
}
