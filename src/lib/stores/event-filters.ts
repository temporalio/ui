import { persistStore } from '$lib/stores/persist-store';

export const eventFilterSort = persistStore('eventFilterSort', '');

export const eventTimeFormat = persistStore('eventTimeFormat', 'UTC');

export const eventShowElapsed = persistStore('eventShowElapsed', 'false');

export type EventFilterType = '' | 'reverse';
export type EventFilterTypeOptions = {
  label: string;
  option: EventFilterType;
}[];

export const setFilterSort = (sort: EventFilterType): void => {
  eventFilterSort.set(sort);
};

export type EventTimeFormatOptions = { label: string; option: TimeFormat }[];
export const setTimeFormat = (format: TimeFormat): void => {
  eventTimeFormat.set(format);
};

export type BooleanString = 'true' | 'false';
export const setShowElapsed = (show: BooleanString): void => {
  eventShowElapsed.set(show);
};
