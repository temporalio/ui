import { writable } from 'svelte/store';
import { persistStore } from '$lib/stores/persist-store';

export const importVisited = persistStore('import:visited', null);

export const viewed = (): void => {
  importVisited.set('true');
};

export const importEvents = writable<FetchEventsResponse>({
  events: [],
  eventGroups: [],
});
