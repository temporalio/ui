import { persistStore } from '$lib/stores/persist-store';

export const eventViewType = persistStore<EventView>('eventView', 'feed');
export const expandAllEvents = persistStore('expandAllEvents', 'false');
