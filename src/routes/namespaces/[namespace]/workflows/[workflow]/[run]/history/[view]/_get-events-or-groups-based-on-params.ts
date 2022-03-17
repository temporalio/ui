import type { Load } from '@sveltejs/kit';

export const getEventsOrGroupsBasedOnParams = ({
  params,
  stuff,
}: Pick<Parameters<Load>[0], 'params' | 'stuff'>):
  | HistoryEventWithId[]
  | CompactEventGroups => {
  const { events, eventGroups } = stuff;
  if (params.view === 'summary') return events;
  if (params.view === 'compact') return eventGroups;
};
