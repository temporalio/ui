import { writable } from 'svelte/store';

export const importEvents = writable<FetchEventsResponse>({
  events: [],
  eventGroups: [],
});
