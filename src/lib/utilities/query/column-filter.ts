import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';

import { isInConditional, isStartsWith } from '../is';
import { MAX_QUERY_LENGTH } from '../request-from-api';
import { isValidFilterValue } from './filter-workflow-query';

const STATUS_ATTRIBUTE_NAMES = ['ExecutionStatus', 'WorkerStatus'] as const;

export type StatusAttribute = (typeof STATUS_ATTRIBUTE_NAMES)[number];

export const STATUS_ATTRIBUTES = new Set<string>(STATUS_ATTRIBUTE_NAMES);

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

const normalizeConditional = (conditional: string): string => {
  const lower = conditional.toLowerCase();
  if (lower === '==') return '=';
  if (lower === '!==') return '!=';
  return lower;
};

const isStatusSelection = (conditional: string): boolean =>
  !conditional || normalizeConditional(conditional) === '=';

export const targetsStatusAttribute = (
  filter: SearchAttributeFilter,
  attribute: string,
): boolean =>
  targetsAttribute(filter, attribute) && isStatusSelection(filter.conditional);

const isEditableInOrGroup = (filter: SearchAttributeFilter): boolean =>
  STATUS_ATTRIBUTES.has(filter.attribute)
    ? targetsStatusAttribute(filter, filter.attribute)
    : targetsAttribute(filter, filter.attribute);

const isOrOperator = (operator: string | undefined) =>
  operator?.toUpperCase() === 'OR';

export const hasMixedOrGroup = (filters: SearchAttributeFilter[]): boolean => {
  let group: SearchAttributeFilter[] = [];

  return filters.some((filter, index) => {
    group.push(filter);
    if (isOrOperator(filter.operator) && index < filters.length - 1) {
      return false;
    }

    const editable = group.filter(isEditableInOrGroup).length;
    const mixed = group.length > 1 && editable > 0 && editable < group.length;
    group = [];
    return mixed;
  });
};

export const hasUnsupportedQuery = (
  filters: SearchAttributeFilter[],
): boolean => filters.some((filter) => filter.unsupportedQuery);

const isQuoteCharacter = (character: string): boolean =>
  character === '"' || character === "'";

export const parseListValues = (value: string | null): string[] => {
  const inner = (value ?? '').trim().replace(/^\(/, '').replace(/\)$/, '');
  const items: string[] = [];
  let item = '';
  let hasItem = false;
  let quote: string | null = null;

  for (const character of inner) {
    if (quote) {
      if (character === quote) quote = null;
      else item += character;
    } else if (isQuoteCharacter(character)) {
      quote = character;
      hasItem = true;
    } else if (character === ',') {
      items.push(item);
      item = '';
      hasItem = false;
    } else if (!/\s/.test(character)) {
      item += character;
      hasItem = true;
    }
  }
  if (hasItem || items.length) items.push(item);

  return items;
};

export const excludesValue = (
  filter: SearchAttributeFilter,
  attribute: string,
  value: string,
): boolean => {
  if (filter.attribute !== attribute || filter.unsupportedQuery) return false;

  const negated = Boolean(filter.negated);
  const conditional = normalizeConditional(filter.conditional);

  if (conditional === '=') return negated && filter.value === value;
  if (conditional === '!=') return negated !== (filter.value === value);
  if (isStartsWith(conditional)) {
    return negated === value.startsWith(filter.value ?? '');
  }
  if (!isListFilterOnSingleValueAttribute(filter)) return false;

  const listed = parseListValues(filter.value).includes(value);
  if (conditional === 'in') return listed === negated;
  return listed !== negated;
};

const matchesValue = (
  filter: SearchAttributeFilter,
  attribute: string,
  value: string,
): boolean => {
  if (filter.attribute !== attribute || filter.unsupportedQuery) return true;

  const conditional = normalizeConditional(filter.conditional);
  const negated = Boolean(filter.negated);

  if (conditional === '=') return negated !== (filter.value === value);
  if (excludesValue(filter, attribute, value)) return false;
  return true;
};

const getOrGroup = (
  filters: SearchAttributeFilter[],
  index: number,
): SearchAttributeFilter[] => {
  let start = index;
  while (start > 0 && isOrOperator(filters[start - 1].operator)) start--;
  let end = index;
  while (end < filters.length - 1 && isOrOperator(filters[end].operator)) end++;
  return filters.slice(start, end + 1);
};

export const removeExclusions = (
  filters: SearchAttributeFilter[],
  attribute: string,
  value: string,
): SearchAttributeFilter[] | null => {
  const excluding = filters.filter((filter, index) => {
    if (!excludesValue(filter, attribute, value)) return false;

    const group = getOrGroup(filters, index);
    return !group.some((member) => matchesValue(member, attribute, value));
  });

  const canRemove = excluding.every(
    (filter) =>
      !isInConditional(filter.conditional) &&
      getOrGroup(filters, filters.indexOf(filter)).length === 1,
  );
  if (!canRemove) return null;

  return filters.filter((filter) => !excluding.includes(filter));
};

export const canAddValue = (
  filters: SearchAttributeFilter[],
  attribute: string,
  value: string,
): boolean => removeExclusions(filters, attribute, value) !== null;

export const isExcludedByQuery = (
  filters: SearchAttributeFilter[],
  filter: SearchAttributeFilter,
  targets: typeof targetsAttribute = targetsAttribute,
): boolean =>
  normalizeConditional(filter.conditional) === '=' &&
  Boolean(filter.value) &&
  !filter.negated &&
  !canAddValue(
    filters.filter((current) => !targets(current, filter.attribute)),
    filter.attribute,
    filter.value,
  );

const dropExclusionsOf = (
  filters: SearchAttributeFilter[],
  added: SearchAttributeFilter[],
): SearchAttributeFilter[] | null =>
  added.reduce<SearchAttributeFilter[] | null>((current, filter) => {
    if (!current) return null;
    if (filter.conditional !== '=' || !filter.value || filter.negated) {
      return current;
    }
    return removeExclusions(current, filter.attribute, filter.value);
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
  const others = dropExclusionsOf(
    filters.filter((filter) => !targets(filter, attribute)),
    replacements,
  );
  if (!others) return filters;
  if (index === -1) return [...others, ...replacements];

  const position = others.filter(
    (filter) => filters.indexOf(filter) < index,
  ).length;
  const nextKept = others[position];
  const joinOperator = nextKept
    ? filters[filters.indexOf(nextKept) - 1]?.operator
    : undefined;

  return [
    ...others.slice(0, position),
    ...withJoinOperator(replacements, joinOperator),
    ...others.slice(position),
  ];
};
