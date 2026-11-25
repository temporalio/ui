import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

import { isInConditional } from '../is';
import { MAX_QUERY_LENGTH } from '../request-from-api';
import { isValidFilterValue } from './filter-workflow-query';

export const isAtQueryLimit = (url: URL): boolean =>
  (url.searchParams.get('query') ?? '').length >= MAX_QUERY_LENGTH;

const EMPTY_LIST_VALUE = '()';

export const isAppliedFilter = ({
  value,
  conditional,
}: SearchAttributeFilter): boolean =>
  isValidFilterValue(value, conditional) &&
  !(isInConditional(conditional) && value === EMPTY_LIST_VALUE);

export const targetsAttribute = (
  filter: SearchAttributeFilter,
  attribute: string,
): boolean =>
  filter.attribute === attribute && !filter.negated && !filter.unsupportedQuery;

const EXCLUDING_CONDITIONALS = new Set(['not in', '!=']);

export const isListFilterOnSingleValueAttribute = ({
  type,
  conditional,
}: SearchAttributeFilter): boolean =>
  isInConditional(conditional) && type !== SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST;

export const isReadOnlyFilter = (filter: SearchAttributeFilter): boolean =>
  Boolean(filter.negated || filter.unsupportedQuery) ||
  isListFilterOnSingleValueAttribute(filter);

export const targetsStatusAttribute = (
  filter: SearchAttributeFilter,
  attribute: string,
): boolean =>
  targetsAttribute(filter, attribute) &&
  !EXCLUDING_CONDITIONALS.has(filter.conditional.toLowerCase());

export const hasUnsupportedQuery = (
  filters: SearchAttributeFilter[],
): boolean => filters.some((filter) => filter.unsupportedQuery);

const withJoinOperator = (
  replacements: SearchAttributeFilter[],
  operator: string | undefined,
): SearchAttributeFilter[] => {
  if (!operator || !replacements.length) return replacements;

  const last = replacements[replacements.length - 1];
  return [...replacements.slice(0, -1), { ...last, operator }];
};

export const replaceAttributeFilters = (
  filters: SearchAttributeFilter[],
  attribute: string,
  replacements: SearchAttributeFilter[],
  targets: typeof targetsAttribute = targetsAttribute,
): SearchAttributeFilter[] => {
  if (hasUnsupportedQuery(filters)) return filters;

  const index = filters.findIndex((filter) => targets(filter, attribute));
  const others = filters.filter((filter) => !targets(filter, attribute));

  if (index === -1) return [...others, ...replacements];

  const nextKept = others[index];
  const joinOperator = nextKept
    ? filters[filters.indexOf(nextKept) - 1]?.operator
    : undefined;

  return [
    ...others.slice(0, index),
    ...withJoinOperator(replacements, joinOperator),
    ...others.slice(index),
  ];
};
