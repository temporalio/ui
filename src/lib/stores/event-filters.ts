import { persistStore } from '$lib/stores/persist-store';

export const eventFilterSort = persistStore('eventFilterSort', '');

export const eventShowElapsed = persistStore('eventShowElapsed', 'false');

export type EventFilterType = '' | 'reverse';
export type EventFilterTypeOptions = {
  label: string;
  option: EventFilterType;
}[];

export const setFilterSort = (sort: EventFilterType): void => {
  eventFilterSort.set(sort);
};

export type BooleanString = 'true' | 'false';
export const setShowElapsed = (show: BooleanString): void => {
  eventShowElapsed.set(show);
};
