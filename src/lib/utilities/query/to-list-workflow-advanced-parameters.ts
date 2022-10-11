import type {
  WorkflowFilter,
  WorkflowSort,
} from '$lib/models/workflow-filters';
import { searchAttributeOptions } from '$lib/stores/search-attributes';
import { formatDuration } from 'date-fns';
import debounce from 'just-debounce';
import { toListWorkflowQueryFromAdvancedFilters } from '$lib/utilities/query/list-workflow-query';

import { isConditional, isJoin, isParenthesis, isBetween } from '../is';
import { durationKeys, fromDate } from '../to-duration';
import { tokenize } from './tokenize';
import { updateQueryParameters } from '../update-query-parameters';

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
  WorkflowId: 'Keyword',
  WorkflowType: 'Keyword',
};

export const toListWorkflowAdvancedParameters = (
  query: string,
  attributes: SearchAttributes = DefaultAttributes,
): WorkflowFilter[] => {
  const tokens = tokenize(query);
  const filters: WorkflowFilter[] = [];
  let filter = emptyFilter();

  if (!query) {
    return [];
  }

  try {
    tokens.forEach((token, index) => {
      if (attributes[token]) {
        filter.attribute = token;
        if (isDatetimeStatement(attributes[token])) {
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

      if (isJoin(token) && !isBetween(getTwoBehind(tokens, index))) {
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
    console.error('Error setting filter parameters: ', e);
    return [];
  }
};

export const combineDropdownFilters = (filters: WorkflowFilter[]) => {
  const statusFilters = filters.filter(
    (f) => f.attribute === 'ExecutionStatus' && f.value,
  );
  const idFilter = filters.filter(
    (f) => f.attribute === 'WorkflowId' && f.value,
  );
  const typeFilter = filters.filter(
    (f) => f.attribute === 'WorkflowType' && f.value,
  );
  const startTimeFilter = filters.filter(
    (f) => f.attribute === 'StartTime' && f.value,
  );

  const activeFilters = [
    statusFilters,
    idFilter,
    typeFilter,
    startTimeFilter,
  ].filter((f) => f.length);

  activeFilters.forEach((filter, index) => {
    if (filter.length && activeFilters[index + 1]?.length) {
      filter[filter.length - 1].operator = 'AND';
    } else if (filter.length && !activeFilters[index + 1]?.length) {
      filter[filter.length - 1].operator = '';
    }
  });

  return [...statusFilters, ...idFilter, ...typeFilter, ...startTimeFilter];
};

export const updateQueryParamsFromFilter = debounce(
  (url: URL, filters: WorkflowFilter[], sorts: WorkflowSort[]) => {
    const allFilters = combineDropdownFilters(filters);
    const query = toListWorkflowQueryFromAdvancedFilters(allFilters, sorts);
    updateQueryParameters({
      url,
      parameter: 'query',
      value: query,
      allowEmpty: false,
    });
  },
  300,
);

export const getConditionalForAttribute = (
  attribute: keyof SearchAttributes,
): string => {
  const filter = searchAttributeOptions().find((t) => t.value === attribute);
  const type = filter?.type;
  if (type === 'Datetime') return 'In Last';
  return '=';
};

export const getDefaultValueForAttribute = (
  attribute: keyof SearchAttributes,
) => {
  const filter = searchAttributeOptions().find((t) => t.value === attribute);
  const type = filter?.type;
  if (type === 'Datetime') return '24 hours';
  if (type === 'Bool') return 'true';
  return '';
};
