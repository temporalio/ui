import { writable } from 'svelte/store';

import type { EventGroups } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvents } from '$lib/types/events';

export const importEvents = writable<WorkflowEvents>([]);
export const importEventGroups = writable<EventGroups>([]);
