import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';

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

export const isReadOnlyFilter = (
  filter: SearchAttributeFilter,
  statusAttribute?: string,
): boolean =>
  Boolean(filter.negated || filter.unsupportedQuery) ||
  (filter.attribute === statusAttribute &&
    filter.conditional.toLowerCase() === 'not in');

export const targetsStatusAttribute = (
  filter: SearchAttributeFilter,
  attribute: string,
): boolean =>
  targetsAttribute(filter, attribute) &&
  !EXCLUDING_CONDITIONALS.has(filter.conditional.toLowerCase());

export const replaceAttributeFilters = (
  filters: SearchAttributeFilter[],
  attribute: string,
  replacements: SearchAttributeFilter[],
  targets: typeof targetsAttribute = targetsAttribute,
): SearchAttributeFilter[] => {
  const index = filters.findIndex((filter) => targets(filter, attribute));
  const others = filters.filter((filter) => !targets(filter, attribute));

  if (index === -1) return [...others, ...replacements];

  return [...others.slice(0, index), ...replacements, ...others.slice(index)];
};
