import cronstrue from 'cronstrue';

import { pluralize } from '$lib/utilities/pluralize';

import type { ScheduleFormData } from '../schema';

export function isValidCronString(cronString: string): boolean {
  try {
    cronstrue.toString(cronString, { throwExceptionOnParseError: true });
    return true;
  } catch {
    return false;
  }
}

export function cronToHumanPreview(
  cronString: string,
  opts: Pick<
    ScheduleFormData,
    | 'startDate'
    | 'timezoneName'
    | 'endDateType'
    | 'endDate'
    | 'endAfterOccurrences'
  >,
): string {
  const previewSegments: string[] = [];

  try {
    previewSegments.push(cronstrue.toString(cronString, { verbose: true }));

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
