import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { persistStore } from '$lib/stores/persist-store';

export type EventSortOrder = 'ascending' | 'descending';
export type EventSortOrderOptions = {
  label: string;
  option: EventSortOrder;
}[];

export const autoRefreshWorkflow = persistStore<'on' | 'off'>(
  'autoRefreshWorkflow',
  'off',
);

export const eventViewType = persistStore<EventView>('eventView', 'feed', true);

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
