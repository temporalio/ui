import { goto as navigateTo } from '$app/navigation';

import type { EventSortOrder } from '$lib/stores/event-view';
import type { EventTypeCategory } from '$lib/types/events';

import { updateMultipleQueryParameters } from './update-query-parameters';

export const SHARED_FILTER_PARAMS = [
  'sort',
  'category',
  'status',
  'frozen',
] as const;

export function getSharedFilterParams(url: URL): Record<string, string> {
  const params: Record<string, string> = {};
  for (const key of SHARED_FILTER_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) params[key] = value;
  }
  return params;
}

export function sharedFilterParamsToString(
  params: Record<string, string>,
): string {
  return new URLSearchParams(params).toString();
}

export function parseEventFilterParams(url: URL) {
  const categoryParam = url.searchParams.get('category');
  return {
    sort: (url.searchParams.get('sort') as EventSortOrder) || 'descending',
    categories: categoryParam
      ? (categoryParam.split(',') as EventTypeCategory[])
      : null,
    statusFilter: url.searchParams.get('status') === 'pending',
    frozen: url.searchParams.get('frozen') === 'true',
  };
}

type FilterUpdate = {
  sort?: EventSortOrder;
  categories?: EventTypeCategory[] | null;
  statusFilter?: boolean;
  frozen?: boolean;
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
      value: filters.categories?.length
        ? filters.categories.join(',')
        : undefined,
    });
  }

  if (filters.statusFilter !== undefined) {
    parameters.push({
      parameter: 'status',
      value: filters.statusFilter ? 'pending' : undefined,
    });
  }

  if (filters.frozen !== undefined) {
    parameters.push({
      parameter: 'frozen',
      value: filters.frozen ? 'true' : undefined,
    });
  }

  return updateMultipleQueryParameters({
    parameters,
    url,
    goto,
  });
}
