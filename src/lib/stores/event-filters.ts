import { persistStore } from '$lib/stores/persist-store';

export const eventFilterSort = persistStore('eventFilterSort', 'asc');

export const eventTimeFormat = persistStore('eventTimeFormat', 'UTC');

export const eventShowElapsed = persistStore('eventShowElapsed', 'false');

export const setFilterSort = (sort: string): void => {
  eventFilterSort.set(sort);
};

export const setTimeFormat = (format: string): void => {
  eventTimeFormat.set(format);
};

export const setShowElapsed = (show: string): void => {
  eventShowElapsed.set(show);
};
