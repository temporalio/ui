import { writable } from 'svelte/store';
<<<<<<< HEAD

export const importEvents = writable<HistoryEventWithId[]>([]);
export const importEventGroups = writable<CompactEventGroups>([]);
=======
import { persistStore } from '$lib/stores/persist-store';

export const importVisited = persistStore('import:visited', null);

export const viewed = (): void => {
  importVisited.set('true');
};

export const importEvents = writable<FetchEventsResponse>({
  events: [],
  eventGroups: [],
});
>>>>>>> 1ca9827 (Change upload to format, add nav link if import screen viewed)
