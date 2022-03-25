import { writable } from 'svelte/store';

export const uploadEvents = writable<FetchEventsResponse>({
  events: [],
  eventGroups: [],
});
