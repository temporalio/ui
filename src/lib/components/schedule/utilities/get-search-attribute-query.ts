import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import type { Payload } from '$lib/types';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributeType,
} from '$lib/types/workflows';
import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
import {
  formatQuickFilterValue,
  type QuickFilterValue,
} from '$lib/utilities/query/quick-filter';

export const escapeSearchAttributeValue = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export function getSearchAttributeQuery(
  attribute: string,
  type: SearchAttributeType | undefined,
  value: Payload | QuickFilterValue,
): string | null {
  if (!attribute || !type) return null;
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean' &&
    !(
      Array.isArray(value) &&
      value.every((item): item is string => typeof item === 'string')
    )
  ) {
    return null;
  }

  const conditional = type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST ? 'in' : '=';
  const formattedValue = formatQuickFilterValue({
    attribute,
    type,
    value: Array.isArray(value) ? value.map(escapeSearchAttributeValue) : value,
    conditional,
  });
  if (formattedValue === null) return null;

  const filter: SearchAttributeFilter = {
    id: '',
    attribute,
    type,
    value:
      type === SEARCH_ATTRIBUTE_TYPE.KEYWORD ||
      type === SEARCH_ATTRIBUTE_TYPE.TEXT ||
      type === SEARCH_ATTRIBUTE_TYPE.DATETIME
        ? escapeSearchAttributeValue(formattedValue)
        : formattedValue,
    conditional,
    operator: '',
    parenthesis: '',
  };
  return toListWorkflowQueryFromFilters([filter]) || null;
}
