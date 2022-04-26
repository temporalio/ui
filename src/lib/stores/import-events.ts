import { writable } from 'svelte/store';

export const importEvents = writable<WorkflowEvent[]>([]);
export const importEventGroups = writable<EventGroups>([]);
