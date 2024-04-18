import debounce from 'just-debounce';

import type { WorkflowFilter } from '$lib/models/workflow-filters';
import { currentPageKey } from '$lib/stores/pagination';
import type { FilterParameters, SearchAttributes } from '$lib/types/workflows';
import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';

import { tokenize } from './tokenize';
import { isValidDate } from '../format-date';
import { isBetween, isConditional, isJoin, isParenthesis } from '../is';
import { durationKeys } from '../to-duration';
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
const isBoolStatement = is('Bool');

export const emptyFilter = (): WorkflowFilter => ({
  attribute: '',
  type: 'Keyword',
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

export const toListWorkflowFilters = (
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
        filter.type = attributes[token];
        if (isDatetimeStatement(attributes[token])) {
          const start = getTwoAhead(tokens, index);
          const hasValidStartTime = isValidDate(start);

          if (isBetween(tokens[index + 1])) {
            const end = tokens[index + 4];
            const hasValidEndTime = isValidDate(end);

            if (hasValidStartTime && hasValidEndTime) {
              filter.value = `BETWEEN "${start}" AND "${end}"`;
              filter.customDate = true;
            } else {
              console.error('Error parsing Datetime field from query');
            }
          } else if (hasValidStartTime) {
            filter.value = start;
          } else {
            console.error('Error parsing Datetime field from query');
          }
        } else if (isBoolStatement(filter.type)) {
          filter.value = tokens[index + 1].replace('=', '');
          filter.conditional = '=';
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
  const runIdFilter = filters.filter((f) => f.attribute === 'RunId' && f.value);
  const timeFilter = filters.filter(
    (f) =>
      (f.attribute === 'StartTime' || f.attribute === 'CloseTime') && f.value,
  );

  const activeFilters = [
    statusFilters,
    idFilter,
    runIdFilter,
    typeFilter,
    timeFilter,
  ].filter((f) => f.length);

  activeFilters.forEach((filter, index) => {
    if (filter.length && activeFilters[index + 1]?.length) {
      filter[filter.length - 1].operator = 'AND';
    } else if (filter.length && !activeFilters[index + 1]?.length) {
      filter[filter.length - 1].operator = '';
    }
  });

  return [
    ...statusFilters,
    ...idFilter,
    ...runIdFilter,
    ...typeFilter,
    ...timeFilter,
  ];
};

export const combineFilters = (filters: WorkflowFilter[]) => {
  filters.forEach((filter, index) => {
    const previousFilter = filters[index - 1];
    if (previousFilter && !previousFilter.operator) {
      previousFilter.operator = 'AND';
    }

    const nextFilter = filters[index + 1];
    if (!nextFilter) {
      filter.operator = '';
    }

    if (
      filter.operator === 'OR' &&
      nextFilter?.attribute !== filter.attribute
    ) {
      filter.parenthesis = '';
      filter.operator = '';
    } else if (filter.operator === 'OR' && previousFilter?.operator !== 'OR') {
      filter.parenthesis = '(';
    } else if (previousFilter?.operator === 'OR' && filter.operator !== 'OR') {
      filter.parenthesis = ')';
    } else {
      filter.parenthesis = '';
    }
  });
  return filters;
};

export const updateQueryParamsFromFilter = debounce(
  (url: URL, filters: WorkflowFilter[], isDropdownFilter = false) => {
    const allFilters = isDropdownFilter
      ? combineDropdownFilters(filters)
      : combineFilters(filters);
    const query = toListWorkflowQueryFromFilters(allFilters);
    updateQueryParameters({
      url,
      parameter: 'query',
      value: query,
      allowEmpty: false,
      clearParameters: [currentPageKey],
    });
  },
  300,
);
