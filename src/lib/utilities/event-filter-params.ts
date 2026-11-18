import { goto as navigateTo } from '$app/navigation';

import {
  type EventGroupKey,
  isEventGroupKey,
} from '$lib/models/event-history/event-group-markers';
import type { EventSortOrder } from '$lib/stores/event-view';
import type { EventTypeCategory } from '$lib/types/events';

import {
  type QueryParameter,
  updateMultipleQueryParameters,
} from './update-query-parameters';

export const SHARED_FILTER_PARAMS = [
  'sort',
  'category',
  'status',
  'refresh_off',
  'groups',
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

const eventGroupSeparator = ',';

const decodeEventGroupKey = (key: string): string => {
  try {
    return decodeURIComponent(key);
  } catch {
    return key;
  }
};

const categorySeparator = ',';

const parseCategories = (value: string | null): EventTypeCategory[] | null => {
  if (value === null) {
    return null;
  }
  if (!value) {
    return [];
  }
  return value.split(categorySeparator) as EventTypeCategory[];
};

const parseEventGroups = (value: string | null): EventGroupKey[] =>
  value
    ? value
        .split(eventGroupSeparator)
        .map(decodeEventGroupKey)
        .filter(isEventGroupKey)
    : [];

const serializeEventGroups = (keys: EventGroupKey[]): string =>
  keys.map((key) => encodeURIComponent(key)).join(eventGroupSeparator);

export function parseEventFilterParams(url: URL) {
  return {
    eventGroups: parseEventGroups(url.searchParams.get('groups')),
    sort: (url.searchParams.get('sort') as EventSortOrder) || 'descending',
    categories: parseCategories(url.searchParams.get('category')),
    statusFilter: url.searchParams.get('status') === 'pending',
    refresh_off: url.searchParams.get('refresh_off') === 'true',
  };
}

type FilterUpdate = {
  sort?: EventSortOrder;
  categories?: EventTypeCategory[] | null;
  statusFilter?: boolean;
  refresh_off?: boolean;
  eventGroups?: EventGroupKey[] | null;
};

export function updateEventFilterParams(
  url: URL,
  filters: FilterUpdate,
  goto: typeof navigateTo = navigateTo,
) {
  const parameters: QueryParameter[] = [];

  if (filters.sort !== undefined) {
    parameters.push({
      parameter: 'sort',
      value: filters.sort === 'descending' ? undefined : filters.sort,
    });
  }

  if (filters.categories !== undefined) {
    parameters.push({
      parameter: 'category',
      value: filters.categories?.join(categorySeparator),
      allowEmpty: filters.categories !== null,
    });
  }

  if (filters.statusFilter !== undefined) {
    parameters.push({
      parameter: 'status',
      value: filters.statusFilter ? 'pending' : undefined,
    });
  }

  if (filters.refresh_off !== undefined) {
    parameters.push({
      parameter: 'refresh_off',
      value: filters.refresh_off ? 'true' : undefined,
    });
  }

  if (filters.eventGroups !== undefined) {
    parameters.push({
      parameter: 'groups',
      value: filters.eventGroups?.length
        ? serializeEventGroups(filters.eventGroups)
        : undefined,
    });
  }

  return updateMultipleQueryParameters({
    parameters,
    url,
    goto,
  });
}
