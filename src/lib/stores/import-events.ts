import { writable } from 'svelte/store';

export const importEvents = writable<HistoryEventWithId[]>([]);
export const importEventGroups = writable<CompactEventGroups>([]);
