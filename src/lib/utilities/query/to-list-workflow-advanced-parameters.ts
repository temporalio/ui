import type { WorkflowFilter } from '$lib/models/workflow-filters';
import { searchAttributes } from '$lib/stores/search-attributes';
import { formatDuration } from 'date-fns';
import { get } from 'svelte/store';
import {
  isConditional,
  isExecutionStatus,
  isJoin,
  isOperator,
  isParenthesis,
} from '../is';
import { durationKeys, fromDate } from '../to-duration';
import { tokenize } from './tokenize';

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

export const toListWorkflowAdvancedParameters = (
  query: string,
  attributes: SearchAttributes,
): WorkflowFilter[] => {
  const tokens = tokenize(query);
  const filters: WorkflowFilter[] = [];
  let filter = emptyFilter();

  try {
    tokens.forEach((token, index) => {
      if (attributes[token]) {
        filter.attribute = token;
        if (isDatetimeStatement(attributes[token])) {
          debugger;
          const start = getTwoAhead(tokens, index);

          try {
            const duration = fromDate(start);
            const largestUnit = getLargestDurationUnit(duration);

            filter.value = formatDuration(largestUnit);
          } catch (error) {
            console.error('Error parsing Datetime field from query', error);
          }
        } else {
          filter.value = getTwoAhead(tokens, index);
        }
      }

      if (isConditional(token)) {
        filter.conditional = token;
      }

      if (isParenthesis(token)) {
        filter.parenthesis = token;
      }

      if (isJoin(token)) {
        filter.operator = token;
        filters.push(filter);
        filter = emptyFilter();
      }

      if (index === tokens.length - 1) {
        filters.push(filter);
        filter = emptyFilter();
      }
    });

    return filters;
  } catch (e) {
    console.log('ERROR SETTING FILTERS: ', e);
    return [];
  }
};
