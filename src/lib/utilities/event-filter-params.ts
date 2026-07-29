import { goto as navigateTo } from '$app/navigation';

import { isCategoryType } from '$lib/models/event-history/get-event-categorization';
import type { EventSortOrder } from '$lib/stores/event-view';
import type { EventClassification, EventTypeCategory } from '$lib/types/events';

import {
  type EventGroupAttribute,
  isEventGroupAttribute,
  isFilterableClassification,
} from './event-group-filters';
import { updateMultipleQueryParameters } from './update-query-parameters';

export const SHARED_FILTER_PARAMS = [
  'sort',
  'category',
  'refresh_off',
] as const;

export function getSharedFilterParams(url: URL): Record<string, string> {
  const params: Record<string, string> = {};
  for (const key of SHARED_FILTER_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) params[key] = value;
  }
  return params;
}

export const NONE_SELECTED = 'none';

function parseListParam<T extends string>(
  value: string | null,
  isValid: (member: string) => member is T,
): T[] | null {
  if (!value) return null;
  if (value === NONE_SELECTED) return [];
  const members = value.split(',').filter(isValid);
  return members.length ? members : null;
}

function serializeListParam(values: string[] | null | undefined) {
  if (values === null || values === undefined) return undefined;
  return values.length ? values.join(',') : NONE_SELECTED;
}

export function parseEventFilterParams(url: URL) {
  return {
    sort: (url.searchParams.get('sort') as EventSortOrder) || 'descending',
    categories: parseListParam(
      url.searchParams.get('category'),
      isCategoryType,
    ),
    classifications: parseListParam(
      url.searchParams.get('classification'),
      isFilterableClassification,
    ),
    attributes: parseListParam(
      url.searchParams.get('attribute'),
      isEventGroupAttribute,
    ),
    refresh_off: url.searchParams.get('refresh_off') === 'true',
  };
}

type FilterUpdate = {
  sort?: EventSortOrder;
  categories?: EventTypeCategory[] | null;
  classifications?: EventClassification[] | null;
  attributes?: EventGroupAttribute[] | null;
  refresh_off?: boolean;
};

export function updateEventFilterParams(
  url: URL,
  filters: FilterUpdate,
  goto: typeof navigateTo = navigateTo,
) {
  const parameters: { parameter: string; value?: string | number | boolean }[] =
    [];

  if (filters.sort !== undefined) {
    parameters.push({
      parameter: 'sort',
      value: filters.sort === 'descending' ? undefined : filters.sort,
    });
  }

  if (filters.categories !== undefined) {
    parameters.push({
      parameter: 'category',
      value: serializeListParam(filters.categories),
    });
  }

  if (filters.classifications !== undefined) {
    parameters.push({
      parameter: 'classification',
      value: serializeListParam(filters.classifications),
    });
  }

  if (filters.attributes !== undefined) {
    parameters.push({
      parameter: 'attribute',
      value: filters.attributes?.length
        ? filters.attributes.join(',')
        : undefined,
    });
  }

  if (filters.refresh_off !== undefined) {
    parameters.push({
      parameter: 'refresh_off',
      value: filters.refresh_off ? 'true' : undefined,
    });
  }

  return updateMultipleQueryParameters({
    parameters,
    url,
    goto,
  });
}
