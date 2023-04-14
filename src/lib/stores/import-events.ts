import { writable } from 'svelte/store';
import type { WorkflowEvents } from 'src/types/events';

export const importEvents = writable<WorkflowEvents>([]);
export const importEventGroups = writable<EventGroups>([]);
