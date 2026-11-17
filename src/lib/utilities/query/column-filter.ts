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

export const replaceAttributeFilters = (
  filters: SearchAttributeFilter[],
  attribute: string,
  replacements: SearchAttributeFilter[],
): SearchAttributeFilter[] => {
  const index = filters.findIndex((filter) => filter.attribute === attribute);
  const others = filters.filter((filter) => filter.attribute !== attribute);

  if (index === -1) return [...others, ...replacements];

  return [...others.slice(0, index), ...replacements, ...others.slice(index)];
};
