import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { persistStore } from '$lib/stores/persist-store';
import { temporalVersion } from './versions';
import { isVersionNewer } from '$lib/utilities/version-check';

export type EventSortOrder = 'ascending' | 'descending';
export type EventSortOrderOptions = {
  label: string;
  option: EventSortOrder;
}[];

export const eventViewType = persistStore<EventView>('eventView', 'feed');

export const expandAllEvents = persistStore('expandAllEvents', 'false');

export const eventFilterSort = persistStore<EventSortOrder>(
  'eventFilterSort',
  'descending',
);

export const eventShowElapsed = persistStore<BooleanString>(
  'eventShowElapsed',
  'false',
);

export const eventCategoryParam = derived([page], ([$page]) =>
  $page.url.searchParams.get('category'),
);

export const eventSortParam = derived([page], ([$page]) =>
  $page.url.searchParams.get('sort'),
);

export const supportsReverseOrder = derived(
  [temporalVersion],
  ([$temporalVersion]) => {
    console.log('supports reverse', isVersionNewer($temporalVersion, '1.16.0'));
    return isVersionNewer($temporalVersion, '1.16.0');
  },
);

export const eventSortOrder = derived(
  [eventFilterSort, supportsReverseOrder, eventSortParam],
  ([$eventFilterSort, $supportsReverseOrder, $eventSortParam]) => {
    if ($supportsReverseOrder) {
      if ($eventSortParam) return $eventSortParam;
      return $eventFilterSort;
    }
    return 'ascending';
  },
);
