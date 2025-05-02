import debounce from 'just-debounce';

import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { emptyFilter } from '$lib/stores/filters';
import { currentPageKey } from '$lib/stores/pagination';
import {
  type FilterParameters,
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
} from '$lib/types/workflows';
import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';

import { tokenize } from './tokenize';
import { isValidDate } from '../format-date';
import {
  isBetween,
  isConditional,
  isJoin,
  isNullConditional,
  isParenthesis,
} from '../is';
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

const getOneAhead = (tokens: Tokens, index: number): string =>
  tokens[index + 1];

const getTwoAhead = (tokens: Tokens, index: number): string =>
  tokens[index + 2];

const getThreeAhead = (tokens: Tokens, index: number): string =>
  tokens[index + 3];

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

const isDatetimeStatement = is(SEARCH_ATTRIBUTE_TYPE.DATETIME);
const isBoolStatement = is(SEARCH_ATTRIBUTE_TYPE.BOOL);

const DefaultAttributes: SearchAttributes = {
  ExecutionStatus: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  StartTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
  CloseTime: SEARCH_ATTRIBUTE_TYPE.DATETIME,
  WorkflowId: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  WorkflowType: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
  RunId: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
};

export const toListWorkflowFilters = (
  query: string,
  attributes: SearchAttributes = DefaultAttributes,
): SearchAttributeFilter[] => {
  const tokens = tokenize(query);
  const filters: SearchAttributeFilter[] = [];
  let filter = emptyFilter();

  if (!query) {
    return [];
  }

  try {
    tokens.forEach((token, index) => {
      const nextToken = getOneAhead(tokens, index);
      const tokenTwoAhead = getTwoAhead(tokens, index);

      if (attributes[token]) {
        filter.attribute = token;
        filter.type = attributes[token];

        if (isNullConditional(nextToken)) {
          const combinedTokens = `${nextToken} ${tokenTwoAhead}`;
          const value = isNullConditional(combinedTokens)
            ? getThreeAhead(tokens, index)
            : tokenTwoAhead;
          filter.value = value.toLocaleLowerCase() === 'null' ? null : value;
        } else if (isDatetimeStatement(attributes[token])) {
          const start = tokenTwoAhead;
          const hasValidStartTime = isValidDate(start);

          if (isBetween(nextToken)) {
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
          filter.value = nextToken.replace('=', '');
          filter.conditional = '=';
        } else {
          filter.value = tokenTwoAhead;
        }
      }

      if (!filter.conditional && isConditional(token)) {
        const combinedTokens = `${token} ${nextToken}`;
        if (isNullConditional(combinedTokens)) {
          filter.conditional = combinedTokens;
        } else {
          filter.conditional = token;
        }
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

export const combineDropdownFilters = (filters: SearchAttributeFilter[]) => {
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

export const combineFilters = (filters: SearchAttributeFilter[]) => {
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
  (url: URL, filters: SearchAttributeFilter[], isDropdownFilter = false) => {
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

export const getFilterIndex = (
  filter: SearchAttributeFilter,
  filters: SearchAttributeFilter[],
) => {
  return filters.findIndex(
    (f) =>
      f.type === filter.type &&
      f.attribute === filter.attribute &&
      f.value === filter.value &&
      f.conditional === filter.conditional,
  );
};

export const addFilter = (
  filter: SearchAttributeFilter,
  filters: SearchAttributeFilter[],
) => {
  const index = getFilterIndex(filter, filters);
  if (index !== -1) return filters;

  filters.push(filter);
  return filters;
};

export const removeFilter = (
  filter: SearchAttributeFilter,
  filters: SearchAttributeFilter[],
) => {
  const index = getFilterIndex(filter, filters);
  if (index === -1) return filters;

  filters.splice(index, 1);
  return filters;
};

export const toggleFilter = (
  filter: SearchAttributeFilter,
  filters: SearchAttributeFilter[],
  url: URL,
) => {
  const index = getFilterIndex(filter, filters);
  if (index === -1) {
    filters = addFilter(filter, filters);
  } else {
    filters = removeFilter(filter, filters);
  }
  updateQueryParamsFromFilter(url, filters);
  return filters;
};

export const getInitialFilters = ({
  url,
  searchAttributes,
  initialFilters,
}: {
  url: URL;
  searchAttributes: SearchAttributes;
  initialFilters: { value: boolean; filter: SearchAttributeFilter }[];
}) => {
  const query = url.searchParams.get('query');
  let filters = query ? toListWorkflowFilters(query, searchAttributes) : [];
  initialFilters.forEach(({ value, filter }) => {
    if (value) {
      filters = addFilter(filter, filters);
    } else {
      filters = removeFilter(filter, filters);
    }
  });
  updateQueryParamsFromFilter(url, filters);
  return filters;
};
