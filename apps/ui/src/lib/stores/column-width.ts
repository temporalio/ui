import { writable } from 'svelte/store';

export const workflowEventsColumnWidth = writable<number>(0);
export const workflowEventsResponsiveColumnWidth = writable<number>(0);
