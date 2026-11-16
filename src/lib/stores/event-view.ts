import { persistStore } from '$lib/stores/persist-store';
import { createUserPreference } from '$lib/stores/user-preference';
import type { EventView } from '$lib/types/events';
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

export const collapseIdleTime = persistStore<'on' | 'off'>(
  'collapseIdleTime',
  'on',
);

export const showTimelineEventGroups = createUserPreference<boolean | null>(
  'showTimelineEventGroups',
  null,
);

export const eventViewType = persistStore<EventView>('eventView', 'feed', true);

export const eventFilterSort = persistStore<EventSortOrder>(
  'eventFilterSort',
  'descending',
);
export const eventShowElapsed = persistStore<BooleanString>(
  'eventShowElapsed',
  'false',
);

export type WorkflowViewPreference = 'timeline' | 'history';

export const workflowViewPreference = persistStore<WorkflowViewPreference>(
  'workflowViewPreference',
  'timeline',
);
