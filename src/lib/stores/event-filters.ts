import { page } from '$app/stores';
import { persistStore } from '$lib/stores/persist-store';
import { derived } from 'svelte/store';

export type EventFilterType = '' | 'reverse';
export type EventFilterTypeOptions = {
  label: string;
  option: EventFilterType;
}[];

export const eventFilterSort = persistStore('eventFilterSort', '');
export const eventShowElapsed = persistStore('eventShowElapsed', 'false');

export const setFilterSort = (sort: EventFilterType): void => {
  eventFilterSort.set(sort);
};

export const setShowElapsed = (show: BooleanString): void => {
  eventShowElapsed.set(show);
};

export const eventCategory = derived([page], ([page]) => {
  return page.url.searchParams.get('category');
});
