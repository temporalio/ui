import { derived, Readable } from 'svelte/store';
import { page } from '$app/stores';
import { persistStore } from '$lib/stores/persist-store';
import { settings } from '$lib/stores/settings';
import { temporalVersion } from './versions';
import { isVersionNewer } from '$lib/utilities/version-check';
import { isSortOrder } from '$lib/utilities/is';

type PageStore = typeof page;
export type EventSortOrder = 'ascending' | 'descending';
export type EventSortOrderOptions = {
  label: string;
  option: EventSortOrder;
}[];

export const autoRefreshWorkflow = persistStore<'on' | 'off'>(
  'autoRefreshWorkflow',
  'off',
);

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

export const eventSortParam: Readable<EventSortOrder> = derived<
  [PageStore],
  EventSortOrder
>([page], ([$page]): EventSortOrder => {
  const sortParameter = $page.url.searchParams.get('sort');
  if (isSortOrder(sortParameter)) return sortParameter;
  return 'descending';
});

export const supportsReverseOrder = derived(
  [temporalVersion, settings],
  ([$temporalVersion, $settings]) => {
    if ($settings.runtimeEnvironment.isCloud) return true;

    return isVersionNewer($temporalVersion, '1.16.0');
  },
);

export const eventSortOrder: Readable<EventSortOrder> = derived(
  [eventFilterSort, supportsReverseOrder, eventSortParam],
  ([$eventFilterSort, $supportsReverseOrder, $eventSortParam]) => {
    let sortOrder: EventSortOrder;
    if ($supportsReverseOrder) {
      if ($eventSortParam) return $eventSortParam;
      sortOrder = $eventFilterSort;
    } else {
      sortOrder = 'ascending';
    }
    return sortOrder;
  },
);
