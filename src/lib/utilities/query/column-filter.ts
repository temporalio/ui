import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

import { isInConditional } from '../is';
import { MAX_QUERY_LENGTH } from '../request-from-api';
import { isValidFilterValue } from './filter-workflow-query';
import { formatListFilterValue } from './search-attribute-filter';

export const isAtQueryLimit = (url: URL): boolean =>
  (url.searchParams.get('query') ?? '').length >= MAX_QUERY_LENGTH;

const EMPTY_LIST_VALUE = '()';

export const isAppliedFilter = ({
  value,
  conditional,
}: SearchAttributeFilter): boolean =>
  isValidFilterValue(value, conditional) &&
  !(isInConditional(conditional) && value === EMPTY_LIST_VALUE);

export const isListFilterOnSingleValueAttribute = ({
  type,
  conditional,
}: SearchAttributeFilter): boolean =>
  isInConditional(conditional) && type !== SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST;

export const targetsAttribute = (
  filter: SearchAttributeFilter,
  attribute: string,
): boolean =>
  filter.attribute === attribute &&
  !filter.negated &&
  !filter.unsupportedQuery &&
  !isListFilterOnSingleValueAttribute(filter);

export const isReadOnlyFilter = (filter: SearchAttributeFilter): boolean =>
  Boolean(filter.negated || filter.unsupportedQuery) ||
  isListFilterOnSingleValueAttribute(filter);

export const targetsStatusAttribute = (
  filter: SearchAttributeFilter,
  attribute: string,
): boolean =>
  targetsAttribute(filter, attribute) &&
  filter.conditional !== '!=' &&
  !isInConditional(filter.conditional);

export const hasUnsupportedQuery = (
  filters: SearchAttributeFilter[],
): boolean => filters.some((filter) => filter.unsupportedQuery);

export const excludesValue = (
  filter: SearchAttributeFilter,
  attribute: string,
  value: string,
): boolean => {
  if (filter.attribute !== attribute || filter.unsupportedQuery) return false;

  const negated = Boolean(filter.negated);
  const conditional = filter.conditional.toLowerCase();

  if (conditional === '=') return filter.value === value && negated;
  if (conditional === '!=') return filter.value === value && !negated;
  if (!isListFilterOnSingleValueAttribute(filter)) return false;

  const listed = formatListFilterValue(filter.value).includes(value);
  if (conditional === 'in') return listed === negated;
  return listed !== negated;
};

const isInOrGroup = (filters: SearchAttributeFilter[], index: number) =>
  filters[index].operator.toUpperCase() === 'OR' ||
  filters[index - 1]?.operator.toUpperCase() === 'OR';

export const removeExclusions = (
  filters: SearchAttributeFilter[],
  attribute: string,
  value: string,
): SearchAttributeFilter[] | null => {
  const excluding = filters
    .map((filter, index) => ({ filter, index }))
    .filter(({ filter }) => excludesValue(filter, attribute, value));

  const canRemove = excluding.every(
    ({ filter, index }) =>
      !isInConditional(filter.conditional) && !isInOrGroup(filters, index),
  );
  if (!canRemove) return null;

  return filters.filter((filter) => !excludesValue(filter, attribute, value));
};

const dropExclusionsOf = (
  filters: SearchAttributeFilter[],
  added: SearchAttributeFilter[],
): SearchAttributeFilter[] =>
  added.reduce((current, filter) => {
    if (filter.conditional !== '=' || !filter.value || filter.negated) {
      return current;
    }
    return removeExclusions(current, filter.attribute, filter.value) ?? current;
  }, filters);

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

  if (index === -1)
    return dropExclusionsOf([...others, ...replacements], replacements);

  const nextKept = others[index];
  const joinOperator = nextKept
    ? filters[filters.indexOf(nextKept) - 1]?.operator
    : undefined;

  return dropExclusionsOf(
    [
      ...others.slice(0, index),
      ...withJoinOperator(replacements, joinOperator),
      ...others.slice(index),
    ],
    replacements,
  );
};
