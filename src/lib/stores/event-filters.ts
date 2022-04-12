import { persistStore } from '$lib/stores/persist-store';

export const eventFilterSort = persistStore('eventFilterSort', '');

export const eventTimeFormat = persistStore('eventTimeFormat', 'utc');

export const eventShowElapsed = persistStore('eventShowElapsed', 'false');

export type EventFilterType = '' | 'reverse';
export type EventFilterTypeOptions = { label: string; option: EventFilterType }[];

export const setFilterSort = (sort: EventFilterType): void => {
  eventFilterSort.set(sort);
};

export type EventTimeFormat = 'utc' | 'relative' | 'local';
export type EventTimeFormatOptions = { label: string; option: EventTimeFormat }[];

export const setTimeFormat = (format: EventTimeFormat): void => {
  eventTimeFormat.set(format);
};

export type BooleanString = 'true' | 'false';
export const setShowElapsed = (show: BooleanString): void => {
  eventShowElapsed.set(show);
};

