import type { EventGroupMarkerDescriptor } from '$lib/models/event-marker-groups';

export const EVENT_GROUP_FILTER_OPTION_LIMIT = 100;

export const limitEventGroupFilterOptions = (
  options: EventGroupMarkerDescriptor[],
  selectedMarkerKeys: ReadonlySet<string>,
): EventGroupMarkerDescriptor[] => {
  if (options.length <= EVENT_GROUP_FILTER_OPTION_LIMIT) return options;

  const selected: EventGroupMarkerDescriptor[] = [];
  const unselected: EventGroupMarkerDescriptor[] = [];
  for (const marker of options) {
    (selectedMarkerKeys.has(marker.markerKey) ? selected : unselected).push(
      marker,
    );
  }
  return [...selected, ...unselected].slice(0, EVENT_GROUP_FILTER_OPTION_LIMIT);
};
