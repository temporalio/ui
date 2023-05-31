import type { WorkflowFilter } from '$lib/models/workflow-filters';
import { formatDuration } from 'date-fns';

import { isConditional, isJoin, isParenthesis, isBetween } from '../is';
import { durationKeys, fromDate } from '../to-duration';
import { tokenize } from './tokenize';

import type { FilterParameters, SearchAttributes } from '$lib/types/workflows';

type Tokens = string[];
export type ParsedParameters = FilterParameters & { timeRange?: string };

const is =
  (identifier: string) =>
  (token: string): boolean => {
    if (token.toLowerCase() === identifier.toLowerCase()) return true;
    return false;
  };

const getTwoAhead = (tokens: Tokens, index: number): string =>
  tokens[index + 2];

const getTwoBehind = (tokens: Tokens, index: number): string =>
  tokens[index - 2];

export const getLargestDurationUnit = (duration: Duration): Duration => {
  if (!duration) return;
  for (const key of durationKeys) {
    if (duration[key]) {
      return { [key]: duration[key] };
    }
  }
};

const isDatetimeStatement = is('Datetime');

const emptyFilter = () => ({
  attribute: '',
  value: '',
  operator: '',
  parenthesis: '',
  conditional: '',
});

const DefaultAttributes: SearchAttributes = {
  ExecutionStatus: 'Keyword',
  StartTime: 'Datetime',
  CloseTime: 'Datetime',
  WorkflowId: 'Keyword',
  WorkflowType: 'Keyword',
  RunId: 'Keyword',
};

export const toListWorkflowFiltersFromRelativeTime = (
  query: string,
  attributes: SearchAttributes = DefaultAttributes,
): WorkflowFilter[] => {
  const tokens = tokenize(query);
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
      filter.attribute = 'startTime';
      filter.value = formatDuration({ [duration]: amount });
      console.log('Filter: ', filter);
      filters.push(filter);
    }

    return filters;
  } catch (e) {
    console.error('Error setting filter parameters: ', e);
    return [];
  }
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
