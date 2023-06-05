import type { WorkflowFilter } from '$lib/models/workflow-filters';

import { durationKeys } from '../to-duration';

import { capitalize } from '../format-camel-case';

const emptyFilter = () => ({
  attribute: '',
  value: '',
  operator: '',
  parenthesis: '',
  conditional: '',
});

export const toListWorkflowFiltersFromRelativeTime = (
  query: string,
  condition: 'latest' | 'earliest' = 'latest',
): WorkflowFilter[] => {
  const filters: WorkflowFilter[] = [];
  const filter = emptyFilter();

  if (!query) {
    return [];
  }

  try {
    const _duration = query.match(/[a-zA-Z]+/g)[0];
    const amount = query.match(/[0-9]+/g)[0];

    const duration =
      ShortHandDurations[_duration] ??
      SingularDurations[_duration] ??
      durationKeys.find((d) => d === _duration);

    if (duration) {
      filter.attribute = 'StartTime';
      filter.conditional = condition === 'latest' ? '<' : '>';
      filter.value = `${amount} ${duration}`;
      filters.push(filter);
    }

    return filters;
  } catch (e) {
    console.error('Error setting filter parameters: ', e);
    return [];
  }
};

export const toReadableRelativeTime = (
  query: string,
  condition: 'latest' | 'earliest' = 'latest',
): string => {
  return `${capitalize(condition)} time ${query}`;
};

const ShortHandDurations = {
  y: 'years',
  M: 'months',
  w: 'weeks',
  d: 'days',
  h: 'hours',
  m: 'minutes',
  s: 'seconds',
};

const SingularDurations = {
  year: 'years',
  month: 'months',
  week: 'weeks',
  day: 'days',
  hour: 'hours',
  minute: 'minutes',
  second: 'seconds',
};
