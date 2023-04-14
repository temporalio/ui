import { writable } from 'svelte/store';

import type { WorkflowEvents } from 'src/types/events';
import type { EventGroups } from '$lib/models/event-groups/event-groups';

export const importEvents = writable<WorkflowEvents>([]);
export const importEventGroups = writable<EventGroups>([]);
