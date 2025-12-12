import { persistStore } from '$lib/stores/persist-store';
import type { EventView, HistoryView } from '$lib/types/events';
import type { BooleanString } from '$lib/types/global';

export type EventSortOrder = 'ascending' | 'descending';
export type EventSortOrderOptions = {
  label: string;
  option: EventSortOrder;
}[];

export const autoRefreshWorkflow = persistStore<'on' | 'off'>(
  'autoRefreshWorkflow',
  'off',
);

export const eventViewType = persistStore<EventView>('eventView', 'feed', true);
export const historyViewType = persistStore<HistoryView>(
  'historyView',
  'timeline',
  true,
);

export const eventFilterSort = persistStore<EventSortOrder>(
  'eventFilterSort',
  'descending',
);
export const eventShowElapsed = persistStore<BooleanString>(
  'eventShowElapsed',
  'false',
);
