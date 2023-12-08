import { get } from 'svelte/store';

import { searchAttributes } from '$lib/stores/search-attributes';
import type { SearchAttributesValue } from '$lib/types/workflows';

export function isStatusFilter(attribute: string) {
  return attribute === 'ExecutionStatus';
}

type FilterAttributeAndType = {
  attribute: string;
  type?: SearchAttributesValue;
};

export function isTextFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (isStatusFilter(attribute)) return false;
  if (type === 'Keyword') return true;

  const searchAttributeType = get(attributes)[attribute];
  return ['Keyword', 'Text', 'String'].includes(searchAttributeType);
}

export function isListFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === 'KeywordList') return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === 'KeywordList';
}

export function isNumberFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === 'Int') return true;

  const searchAttributeType = get(attributes)[attribute];
  return ['Int', 'Double'].includes(searchAttributeType);
}

export function isDurationFilter(attribute: string) {
  return ['ExecutionDuration'].includes(attribute);
}

export function isDateTimeFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === 'Datetime') return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === 'Datetime';
}

export function isBooleanFilter(
  { attribute, type }: FilterAttributeAndType,
  attributes = searchAttributes,
) {
  if (type === 'Bool') return true;

  const searchAttributeType = get(attributes)[attribute];
  return searchAttributeType === 'Bool';
}

export function getFocusedElementId({
  attribute,
  type,
}: FilterAttributeAndType) {
  if (isStatusFilter(attribute)) return 'status-filter';

  if (
    isTextFilter({ attribute, type }) ||
    isNumberFilter({ attribute, type }) ||
    isDateTimeFilter({ attribute, type })
  )
    return 'conditional-menu-button';

  if (isListFilter({ attribute, type })) return 'list-filter-search';

  if (isBooleanFilter({ attribute, type })) return 'boolean-filter';

  return '';
}
