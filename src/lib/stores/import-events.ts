import type { WorkflowEvents } from 'src/types/events';
import { writable } from 'svelte/store';

export const importEvents = writable<WorkflowEvents>([]);
export const importEventGroups = writable<EventGroups>([]);
