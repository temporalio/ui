import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';

import { isInConditional, isNullConditional } from '../is';
import { MAX_QUERY_LENGTH } from '../request-from-api';

export const isAtQueryLimit = (url: URL): boolean =>
  (url.searchParams.get('query') ?? '').length >= MAX_QUERY_LENGTH;

const EMPTY_LIST_VALUE = '()';

export const isAppliedFilter = (filter: SearchAttributeFilter): boolean => {
  if (isNullConditional(filter.conditional)) return true;
  if (isInConditional(filter.conditional)) {
    return Boolean(filter.value) && filter.value !== EMPTY_LIST_VALUE;
  }
  return Boolean(filter.value);
};

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

export const upsertFilter = (
  filters: SearchAttributeFilter[],
  filter: SearchAttributeFilter,
): SearchAttributeFilter[] =>
  filters.some(({ id }) => id === filter.id)
    ? filters.map((existing) => (existing.id === filter.id ? filter : existing))
    : [...filters, filter];

export const removeFilterById = (
  filters: SearchAttributeFilter[],
  id: string,
): SearchAttributeFilter[] => filters.filter((filter) => filter.id !== id);
