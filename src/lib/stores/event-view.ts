import { persistStore } from '$lib/stores/persist-store';

export type EventSortOrder = 'ascending' | 'descending';
export type EventSortOrderOptions = {
  label: string;
  option: EventSortOrder;
}[];

export const eventViewType = persistStore<EventView>('eventView', 'feed');
export const expandAllEvents = persistStore('expandAllEvents', 'false');

export const eventSortOrder = persistStore<EventSortOrder>(
  'eventFilterSort',
  'descending',
);

export const eventShowElapsed = persistStore<BooleanString>(
  'eventShowElapsed',
  'false',
);
