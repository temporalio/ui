import { persistStore } from '$lib/stores/persist-store';

export const eventFilterSort = persistStore('eventFilterSort', 'asc');

export const eventTimeFormat = persistStore('eventTimeFormat', 'UTC');

type SortDirection = 'asc' | 'desc';

export const setFilterSort = (sort: string): void => {
  eventFilterSort.set(sort);
};

export const setTimeFormat = (format: string): void => {
  eventTimeFormat.set(format);
};
