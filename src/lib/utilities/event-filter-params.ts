import { goto as navigateTo } from '$app/navigation';

import type { TimelineViewMode } from '$lib/components/lines-and-dots/timeline-graph/types';
import type { EventSortOrder } from '$lib/stores/event-view';
import type { EventTypeCategory } from '$lib/types/events';

import { updateMultipleQueryParameters } from './update-query-parameters';

export const SHARED_FILTER_PARAMS = [
  'sort',
  'category',
  'status',
  'refresh_off',
  'follow_continues',
  'timeline_mode',
  'show_groups',
  'show_tree',
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
  const timelineModeParam = url.searchParams.get('timeline_mode');
  // Full duration is hidden for now: the sliding window covers the same ground
  // (zoomed out it shows the whole run). Links to it, and to the old `lanes`
  // view, open the sliding window rather than a mode the toolbar can't show.
  const timelineDisplayMode: TimelineViewMode =
    timelineModeParam === 'classic' ? 'classic' : 'fixed-window';

  return {
    sort: (url.searchParams.get('sort') as EventSortOrder) || 'descending',
    // Containment frames are the default, so the param only turns them off.
    showGroups: url.searchParams.get('show_groups') !== 'false',
    // The tree is shown by default, so the param only hides it.
    showTree: url.searchParams.get('show_tree') !== 'false',
    categories: categoryParam
      ? (categoryParam.split(',') as EventTypeCategory[])
      : null,
    statusFilter: url.searchParams.get('status') === 'pending',
    refresh_off: url.searchParams.get('refresh_off') === 'true',
    timelineDisplayMode,
  };
}

type FilterUpdate = {
  sort?: EventSortOrder;
  categories?: EventTypeCategory[] | null;
  statusFilter?: boolean;
  refresh_off?: boolean;
  timelineDisplayMode?: TimelineViewMode;
  showGroups?: boolean;
  showTree?: boolean;
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

  if (filters.refresh_off !== undefined) {
    parameters.push({
      parameter: 'refresh_off',
      value: filters.refresh_off ? 'true' : undefined,
    });
  }

  if (filters.timelineDisplayMode !== undefined) {
    parameters.push({
      parameter: 'timeline_mode',
      value:
        filters.timelineDisplayMode === 'fixed-window'
          ? undefined
          : filters.timelineDisplayMode,
    });
  }

  if (filters.showGroups !== undefined) {
    parameters.push({
      parameter: 'show_groups',
      value: filters.showGroups ? undefined : 'false',
    });
  }

  if (filters.showTree !== undefined) {
    parameters.push({
      parameter: 'show_tree',
      value: filters.showTree ? undefined : 'false',
    });
  }

  return updateMultipleQueryParameters({
    parameters,
    url,
    goto,
  });
}
