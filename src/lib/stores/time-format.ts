import { persistStore } from '$lib/stores/persist-store';

export const timeFormat = persistStore('timeFormat', 'UTC');

export type TimeFormatOptions = { label: string; option: TimeFormat }[];

export const setTimeFormat = (format: TimeFormat): void => {
  timeFormat.set(format);
};
